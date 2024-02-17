import Image from "next/image";
import { Inter } from "next/font/google";
import { signIn, signOut, useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { Button, ButtonGroup } from "@mui/material";
import JobListing from "@/components/JobListing";
import { FirestoreContext } from "@/contexts/FirestoreContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import AdminView from "@/components/AdminView";
import ForHireListing from "@/components/ForHireListing";


const inter = Inter({ subsets: ["latin"] });

export default function Home() {

  const { data: session } = useSession();
  const database = useContext(FirestoreContext);

  const [whichForm, setWhichForm] = useState<'jobListing' | 'lookingForJob' | 'viewAll' | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isBanned, setIsBanned] = useState<boolean>(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session || !database) return;
      if (!session.user?.id) return;
      const querySnapshot = await getDocs(query(collection(database, "admins"), where("id", "==", session.user?.id)));

      setIsAdmin(querySnapshot.size === 1);
    }

    const checkIsBanned = async () => {
      if (!session || !database) return;
      if (!session.user?.id) return;
      const querySnapshot = await getDocs(query(collection(database, "banned"), where("id", "==", session.user?.id)));

      setIsBanned(querySnapshot.size === 1);
    }

    checkAdmin();
    checkIsBanned();
  }, [session, database])


  return (
    <main
      className={`flex min-h-screen flex-col p-24 ${inter.className}`}
    >
      <h1 className="text-4xl font-bold text-center">
        Welcome to{" "}
        <a
          href="https://discord.gg/devcord"
          className="text-primary hover:underline"
        >
          devcord jobs
        </a>
      </h1>

      {session ? (
        <>
          <div className="flex flex-col items-center mt-4">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt=""
                width={128}
                height={128}
                style={{ borderRadius: '50%' }}
              />
            )}
            <p>
              Hello, {session.user?.name}!
            </p>
            <button onClick={() => signOut()} className="mt-2 max-w-48 hover:text-primary underline">Sign Out</button>
          </div>

          <main style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '2rem',
            flexDirection: 'column'
          }}>

            {isBanned && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-3" role="alert">
                <strong className="font-bold">Banned!</strong>
                <span className="block sm:inline">You have been banned from posting jobs.</span>
              </div>)}

            {whichForm === undefined && (
              <div className="flex items-center flex-col mt-4">
                <p className="text-center">Get started by selecting a form</p>
              </div>
            )}

            <ButtonGroup variant="outlined" disabled={isBanned} style={{
              display: 'flex',
              justifyContent: 'center',
            }}>
              <Button
                onClick={() => setWhichForm('jobListing')}
                variant={whichForm === 'jobListing' ? 'contained' : 'outlined'}
              >Job Listing</Button>
              <Button
                onClick={() => setWhichForm('lookingForJob')}
                variant={whichForm === 'lookingForJob' ? 'contained' : 'outlined'}
              >Looking for Job</Button>
              {isAdmin && (
                <Button onClick={() => setWhichForm("viewAll")}
                  variant={whichForm === 'viewAll' ? 'contained' : 'outlined'}
                >admin View</Button>)
              }
            </ButtonGroup>

            {whichForm === 'jobListing' && (
              <JobListing />
            )}

            {whichForm === 'lookingForJob' && (
              <ForHireListing />
            )}
            {whichForm === 'viewAll' && (
              <AdminView />
            )}

          </main>
        </>
      ) : (
        <div className="flex items-center flex-col mt-4">
          <p className="text-center">Get started by signing in with Discord</p>
          <button onClick={() => signIn('discord')} className="border-white border-2 px-4 py-2 mt-2 max-w-48">Sign in</button>
        </div>
      )}

    </main>
  );
}
