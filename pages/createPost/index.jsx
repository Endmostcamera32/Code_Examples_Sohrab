import { useSession, signIn, signOut } from "next-auth/react"
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import { redirect } from "next/dist/server/api-utils"
import SimpleCodeEditor from "../../components/SimpleCodeEditor"
import NewPostForm from "../../components/NewPostForm"
import axios from "axios"
import { useRouter } from "next/router"

export default function CreatePost({session, userEmail}) {

  const router = useRouter()
    async function handleSubmit({code, language}) {
        console.log(code, language)
        await axios.post("/api/addPost", {
          text: code,
          language: language,
          userEmail: userEmail
        }).then((result) => {
          if (result.data.name === "John Doe") {
            router.push("/")
          }
        })
    }

  return (
    <>
    <NewPostForm onSubmit={handleSubmit} />
    </>
  )
}


export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)

  
  console.log(session)
  
  if (!session) {
    return {
      redirect: {
        destination: "api/auth/signin",
        permanent: false
      }
    }
  }
  const userEmail = session.user.email;
  
  return {
    props: {
      session,
    userEmail
    }
  }
}