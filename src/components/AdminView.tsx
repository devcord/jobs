import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { FirestoreContext } from "@/contexts/FirestoreContext";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";

import { DataGrid, GridActionsCellItem, GridSortModel, type GridColDef } from '@mui/x-data-grid';
import { type ForHireData, type JobData } from "@/types/Job";
import { CheckOutlined, CloseOutlined, DeleteOutline, SecurityOutlined } from "@mui/icons-material";
import { markdownToHtml } from "@/utils/parser";


const AdminView = () => {
  const { data: session } = useSession();
  const database = useContext(FirestoreContext);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [jobs, setJobs] = useState<JobData[]>([]);
  const [hire, setHire] = useState<ForHireData[]>([]);


  useEffect(() => {
    const checkAdmin = async () => {
      if (!session || !database) return;
      if (!session.user?.name) return;
      const querySnapshot = await getDocs(query(collection(database, "admins"), where("name", "==", session.user?.name)));

      setIsAdmin(querySnapshot.size === 1);
    }

    checkAdmin();
  }, [session, database])

  useEffect(() => {
    if (!isAdmin || !database) return;

    const unsubscribe = onSnapshot(collection(database, "jobs"), (snapshot) => {
      const newJobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() as JobData }));
      setJobs(newJobs);
    });

    return () => unsubscribe();

  }, [database, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !database) return;

    const unsubscribe = onSnapshot(collection(database, "hire"), (snapshot) => {
      const newHire = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() as ForHireData }));
      setHire(newHire);
    });

    return () => unsubscribe();

  }, [database, isAdmin]);

  const handleDeleteDoc = async (id: string, which: 'jobs' | 'hire') => {
    if (!database) return;

    await deleteDoc(doc(database, `${which}/${id}`));
  }

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected', which: 'jobs' | 'hire') => {
    if (!database) return;

    const docRef = doc(database, `${which}/${id}`);

    await updateDoc(docRef, {
      status,
      "metadata.updatedAt": Date.now(),
      "metadata.updatedBy": session?.user?.name ?? 'Admin',
      ...(status === 'approved' && { "metadata.posted": 0 })
    });
  }

  const handleBanUser = async (id: string) => {
    if (!database) return;

    // Get the user's name from the job
    const docRef = doc(database, `jobs/${id}`);
    const docSnap = await getDoc(docRef);
    const docData = docSnap.data() as JobData;

    // Add the user to the banned collection
    addDoc(collection(database, "banned"), { name: docData.postedBy.name, bannedAt: Date.now(), bannedBy: session?.user?.name ?? 'Admin' });
  };

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: 'metadata.updatedAt',
      sort: 'desc',
    },
  ]);


  if (!session) return <div>loading...</div>
  if (!isAdmin) return <div>you are not an admin</div>

  const jobDataColumns: readonly GridColDef<JobData>[] = [
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<CheckOutlined />}
          label="Approve"
          onClick={() => handleStatusChange(params.row.id!, 'approved', 'jobs')}
          key={`approve-${params.id}`}
        />,
        <GridActionsCellItem
          icon={<CloseOutlined />}
          label="Reject"
          onClick={() => handleStatusChange(params.row.id!, 'rejected', 'jobs')}
          key={`reject-${params.id}`}
        />,
        <GridActionsCellItem
          icon={<DeleteOutline />}
          label="Delete"
          onClick={() => handleDeleteDoc(params.row.id!, 'jobs')}
          key={`delete-${params.id}`}
        />,
        <GridActionsCellItem
          icon={<SecurityOutlined />}
          label="Ban User"
          onClick={() => handleBanUser(params.row.id!)}
          key={`toggle-${params.id}`}
        />,
      ],
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      valueGetter: (params) => params.row.status.toLocaleUpperCase(),
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 150,
    },
    {
      field: 'description',
      headerName: 'Description',
      // We want to render the markdown as html
      // so we need to use a custom renderer
      renderCell: (params) => {
        return <div dangerouslySetInnerHTML={{ __html: markdownToHtml(params.row.description) }} />
      },
      minWidth: 450,
      flex: 1,
    },
    {
      field: 'salary',
      headerName: 'Salary ($USD/hr)',
      width: 150,
      valueGetter: (params) => `$${params.row.salary[0]} - $${params.row.salary[1]}`
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 250,
      valueGetter: (params) => params.row.tags.map((x) => x.title)
    },
    {
      field: 'postedBy',
      headerName: 'Posted By',
      width: 150,
      valueGetter: (params) => params.row.postedBy.name
    },
    {
      field: 'metadata.updatedAt',
      headerName: 'Updated At',
      width: 250,
      valueGetter: (params) => new Date(params.row.metadata?.updatedAt ?? 0).toLocaleString()
    },
    {
      field: 'metadata.updatedBy',
      headerName: 'Updated By',
      width: 150,
      valueGetter: (params) => params.row.metadata?.updatedBy ?? ''
    }
  ];

  const hireDataColumns: readonly GridColDef<ForHireData>[] = [
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<CheckOutlined />}
          label="Approve"
          onClick={() => handleStatusChange(params.row.id!, 'approved', 'hire')}
          key={`approve-${params.id}`}
        />,
        <GridActionsCellItem
          icon={<CloseOutlined />}
          label="Reject"
          onClick={() => handleStatusChange(params.row.id!, 'rejected', 'hire')}
          key={`reject-${params.id}`}
        />,
        <GridActionsCellItem
          icon={<DeleteOutline />}
          label="Delete"
          onClick={() => handleDeleteDoc(params.row.id!, 'hire')}
          key={`delete-${params.id}`}
        />,
        <GridActionsCellItem
          icon={<SecurityOutlined />}
          label="Ban User"
          onClick={() => handleBanUser(params.row.id!)}
          key={`toggle-${params.id}`}
        />,
      ],
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      valueGetter: (params) => params.row.status.toLocaleUpperCase(),
    },
    {
      field: 'description',
      headerName: 'Description',
      // We want to render the markdown as html
      // so we need to use a custom renderer
      renderCell: (params) => {
        return <div dangerouslySetInnerHTML={{ __html: markdownToHtml(params.row.description) }} />
      },
      minWidth: 250,
      flex: 1,
    },
    {
      field: 'salary',
      headerName: 'Salary ($USD/hr)',
      width: 150,
      valueGetter: (params) => `$${params.row.salary[0]} - $${params.row.salary[1]}`
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 250,
      valueGetter: (params) => params.row.tags.map((x) => x.title)
    },
    {
      field: 'postedBy',
      headerName: 'Posted By',
      width: 150,
      valueGetter: (params) => params.row.postedBy.name
    },
    {
      field: 'metadata.updatedAt',
      headerName: 'Updated At',
      width: 250,
      valueGetter: (params) => new Date(params.row.metadata?.updatedAt ?? 0).toLocaleString()
    },
    {
      field: 'metadata.updatedBy',
      headerName: 'Updated By',
      width: 150,
      valueGetter: (params) => params.row.metadata?.updatedBy ?? ''
    }
  ];

  return (
    <div style={{ marginTop: '1em' }}>
      <h1>Admin View</h1>

      <h2>Jobs</h2>
      <DataGrid
        rows={jobs}
        columns={jobDataColumns}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model)}
      />

      <h2 style={{
        marginTop: '2em'
      }}>For Hire</h2>
      <DataGrid
        rows={hire}
        columns={hireDataColumns}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model)}
      />
    </div>
  )


}

export default AdminView;