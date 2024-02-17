import { useState, type FC, useContext, useEffect } from 'react';
import TextField from './TextField';
import { Alert, Button, Popover, Slider, createFilterOptions } from '@mui/material';
import { JOB_TAGS, type JobTagType } from '@/utils/constants';
import TagPicker from './TagPicker';
import { FirestoreContext } from '@/contexts/FirestoreContext';
import { useSession } from "next-auth/react";
import { addDoc, collection } from 'firebase/firestore';
import { LoadingButton } from '@mui/lab';
import { type JobData } from '@/types/Job';

const valueLabelFormat = (value: number) => {
  return `$${value}/hr`;
}

const filter = createFilterOptions<JobTagType>();

export const JobListing: FC = () => {
  const [jobTitle, setJobTitle] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [salary, setSalary] = useState<number[]>([50, 120]);
  const [tags, setTags] = useState<JobTagType[]>([]);
  const [status, setStatus] = useState<'SUCCESS' | 'ERROR' | 'LOADING' | 'IDLE'>('IDLE');
  const [message, setMessage] = useState<string | null>(null);
  const database = useContext(FirestoreContext);
  const { data: session } = useSession({
    required: true,
  });


  const handleJobPost = async () => {
    setStatus('LOADING');

    if (!database || !session) {
      setStatus('ERROR');
      setMessage('Database or session not available');
      return;
    }

    console.log(session);

    const jobData: JobData = {
      title: jobTitle,
      description: jobDescription,
      salary: salary,
      tags: tags,
      postedBy: {
        name: session.user?.name ?? 'Unknown',
        id: session.user.id ?? '0'
      },
      status: 'pending',
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    }

    addDoc(collection(database, "jobs"), jobData).then((docRef) => {
      const docId = docRef.id;
      setStatus('SUCCESS');
      setMessage(`Job posted successfully with ID: ${docId}. Please wait for approval.`);
    }).catch((error) => {
      setStatus('ERROR');
      setMessage('Error posting job: ' + error.message ?? 'Unknown error');
    });
  }

  return (
    <>
      {/* Create a form for submitting a job */}
      <div className="flex flex-col mt-8">
        <h2 className="text-xl font-bold">Submit a job listing</h2>

        {/* Job Title */}
        <label htmlFor="title" className="mt-4">
          Job Title
        </label>
        <TextField id="title" name="title" variant="outlined" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        {/* Job Description */}
        <label htmlFor="description" className="mt-4">
          Job Description
          {' '}
          <small>
            (Markdown not supported yet)
          </small>
        </label>
        <TextField id="description" name="description" variant="outlined" multiline rows={4} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />

        {/* Job Salary Range (USD) */}
        <label htmlFor="salary" className="mt-4">
          Salary Range (USD per hour)
        </label>
        {/* Slider */}
        <Slider
          value={salary}
          onChange={(e, newValue) => {
            if (Array.isArray(newValue))
              setSalary(newValue)
            else {
              setSalary([newValue, newValue])
            }
          }}
          valueLabelDisplay="auto"
          valueLabelFormat={valueLabelFormat} min={20} max={250}
        />
        {/* Text saying range */}
        <p>
          ${salary[0]} - ${salary[1]} per hour
        </p>
        {/* Tag box */}
        <label htmlFor="tags" className="mt-4">
          Tags
        </label>
        <TagPicker
          multiple
          value={tags}
          id="tags"
          options={JOB_TAGS}
          freeSolo
          filterOptions={(options, params) => {
            const opts = options as JobTagType[];
            const filtered = filter(opts, params);
            const { inputValue } = params;
            // Suggest the creation of a new value
            const isExisting = opts.some((option) => inputValue === option.title);
            if (inputValue !== '' && !isExisting) {
              filtered.push({
                inputValue,
                title: `Add "${inputValue}"`,
              });
            }

            return filtered;
          }}
          // @ts-ignore
          getOptionLabel={(option: unknown) => {
            const opt: JobTagType | string = option as unknown as JobTagType | string;
            if (typeof opt === 'string') return option;
            if (opt.inputValue) return opt.inputValue
            return opt.title
          }}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" />
          )}
          onChange={(e, newValue) => {
            const nv = newValue as JobTagType[]

            if (nv.length === 0) {
              setTags([]);
              return;
            }

            // If we have less tags than before, it means we removed a tag
            if (nv.length < tags.length) {
              setTags(nv);
              return;
            }

            const newestValue = nv[nv.length - 1];

            if (typeof newestValue === 'string') {
              setTags([...tags, {
                title: newestValue
              }])
            }
            else if (newestValue && newestValue.inputValue) {
              setTags([...tags, {
                title: newestValue.inputValue
              }])
            } else {
              setTags([...tags, { title: newestValue.title }]);
            }
          }}
        />
        {status === 'SUCCESS' && (
          <>
            <Alert severity="success">{message}</Alert>
          </>
        )}
        {status === 'ERROR' && (
          <>
            <Alert severity="error">{message}</Alert>
          </>
        )}
        {/* Submit button */}
        <LoadingButton
          variant="outlined"
          onClick={handleJobPost}
          disabled={!jobTitle || !jobDescription || !tags.length || session === null}
          style={{
            marginTop: '1rem'
          }}
          loading={status === 'LOADING'}

          loadingPosition="start"
          loadingIndicator="Loading..."
        >
          Submit Job
        </LoadingButton>
      </div>
    </>
  )

};

export default JobListing;
