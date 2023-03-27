import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import PostSmall from "../../components/PostSmall/index";
import { useEffect, useState } from "react";
import axios from "axios";
import { prisma } from "../../server/db/client";
import Comments from "../../components/Comments/index";

export default function Home({ postsJson, commentsJson }) {
  const [posts, setPosts] = useState(postsJson);
  const [comments, setComments] = useState(commentsJson);

  const router = useRouter();

  return (
    <>
      {posts.map((m) => (
        <PostSmall
          key={m.postId}
          post={m}
          href={`/code/${m.postId}`}
          user={m.user}
        />
      ))}
      <Comments comments={comments} />
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: "api/auth/signin",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });
  const posts = await prisma.post.findMany({
    where: {
      userId: user.id,
    },
    include: {
      comments: true,
      likes: true,
      user: true,
    },
  });
  const comments = await prisma.comment.findMany({
    where: {
      userId: user.id,
    },
    include: {
        user: true
    }
  });

  const postsJson = JSON.parse(JSON.stringify(posts));
  const commentsJson = JSON.parse(JSON.stringify(comments));

  postsJson.map((m) => {
    let howManyComments = m.comments.length;
    m.totalComments = howManyComments;
    let howManyLikes = m.likes.length;
    m.totalLikes = howManyLikes;
  });

  return {
    props: {
      session,
      postsJson,
      commentsJson,
    },
  };
}
