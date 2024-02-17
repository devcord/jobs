import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { FirestoreContext } from "@/contexts/FirestoreContext";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";

import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { type JobData } from "@/types/Job";
import { CheckOutlined, CloseOutlined, DeleteOutline, FileCopyOutlined, SecurityOutlined } from "@mui/icons-material";
import { update } from "firebase/database";


const AdminView = () => {
  const { data: session } = useSession();
  const database = useContext(FirestoreContext);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [jobs, setJobs] = useState<JobData[]>([]);


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

  const handleDeleteDoc = async (id: string) => {
    if (!database) return;

    await deleteDoc(doc(database, `jobs/${id}`));
  }

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    if (!database) return;

    const docRef = doc(database, `jobs/${id}`);

    await updateDoc(docRef, { status, "metadata.updatedAt": Date.now(), "metadata.updatedBy": session?.user?.name ?? 'Admin' });
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


  if (!session) return <div>loading...</div>
  if (!isAdmin) return <div>you are not an admin</div>

  const columns: readonly GridColDef<JobData>[] = [
    {
      field: 'actions',
      type: 'actions',
      resizable: true,
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<CheckOutlined />}
          label="Approve"
          onClick={() => handleStatusChange(params.row.id!, 'approved')}
          key={`approve-${params.id}`}
        />,
        <GridActionsCellItem
          icon={<CloseOutlined />}
          label="Reject"
          onClick={() => handleStatusChange(params.row.id!, 'rejected')}
          key={`reject-${params.id}`}
        />,
        <GridActionsCellItem
          icon={<DeleteOutline />}
          label="Delete"
          onClick={() => handleDeleteDoc(params.row.id!)}
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
      field: 'status', headerName: 'Status', width: 150, valueGetter: (params) => params.row.status.toLocaleUpperCase(),
      resizable: true,
    },
    {
      field: 'title', headerName: 'Title', width: 150,
      resizable: true,
    },
    { field: 'description', headerName: 'Description', minWidth: 250, flex: 1, resizable: true, },
    { field: 'salary', headerName: 'Salary ($USD/hr)', resizable: true, width: 150, valueGetter: (params) => `$${params.row.salary[0]} - $${params.row.salary[1]}` },
    { field: 'tags', headerName: 'Tags', width: 250, resizable: true, valueGetter: (params) => params.row.tags.map((x) => x.title) },
    { field: 'postedBy', headerName: 'Posted By', resizable: true, width: 150, valueGetter: (params) => params.row.postedBy.name },
    { field: 'metadata', headerName: 'Updated At', resizable: true, width: 250, valueGetter: (params) => new Date(params.row.metadata?.updatedAt ?? 0).toLocaleString() },
  ];

  return (
    <div style={{ marginTop: '1em' }}>
      <h1>Admin View</h1>

      <DataGrid rows={jobs} columns={columns} />
    </div>
  )


}

export default AdminView;