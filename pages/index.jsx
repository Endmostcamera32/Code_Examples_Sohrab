import Button from "../components/Button/index";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import PostSmall from "../components/PostSmall/index";
import { useEffect, useState } from "react";
import axios from "axios";
import { prisma } from "../server/db/client";

export default function Home({ jsonPosts, user_Json, likes_Json }) {
  const [posts, setPosts] = useState(jsonPosts);
  const { data: session } = useSession();
  const router = useRouter();

  async function handleOnLike(liked) {
    if (session) {
      console.log(liked)
      if (!liked.liked) {
        await axios.post("/api/removeLike", {email: session.user.email, postId: liked.postId}).then(res => {
          setPosts(res.data)
        })
      } else {
        await axios.put("/api/removeLike", {email: session.user.email, postId: liked.postId}).then(res => {
          setPosts(res.data)
        })
      }
    } else {
      router.push("/api/auth/signin");
    }
  }

  async function handleGoToPost(m) {
    router.push(`/code/${m.postId}`)
  }


  if (!session) {
    return (
      <>
        {posts.map((m) => (
          <PostSmall
            key={m.postId}
            post={m}
            href={`/code/${m.postId}`}
            user={m.user}
            onLike={handleOnLike}
            onComment={handleGoToPost}
          />
        ))}
      </>
    );
  } else {
    return (
      <>
        <Button onClick={() => router.push("/createPost")}>
          Make a new post
        </Button>

        {posts.map((m) => (
          <PostSmall
            key={m.postId}
            post={m}
            href={`/code/${m.postId}`}
            user={m.user}
            onLike={handleOnLike}
            onComment={handleGoToPost}
          />
        ))}
      </>
    );
  }
}

export async function getServerSideProps(context) {
  const allPosts = await prisma.post.findMany({
    include: {
      user: true,
      comments: true,
      likes: true,
    },
  });

  allPosts.map((m) => {
    let howManyComments = m.comments.length;
    m.totalComments = howManyComments;
    let howManyLikes = m.likes.length;
    m.totalLikes = howManyLikes;
  });
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  console.log(session);
  if (session) {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    const likes = await prisma.like.findMany({
      include: {
        user: true,
      },
    });

    const user_Json = JSON.parse(JSON.stringify(user));
    const likes_Json = JSON.parse(JSON.stringify(likes));
    const jsonPosts = JSON.parse(JSON.stringify(allPosts));

    likes_Json.forEach((e) => {
      if (e.user.email == user_Json.email) {
        // e.liked = true;
        jsonPosts.map((m) => {
          m.likes.map((l) => {
            if (l.likeId == e.likeId) {
              m.liked = true;
            }
          });
        });
      }
    });

    return {
      props: {
        session,
        user_Json,
        likes_Json,
        jsonPosts,
      },
    };
  } else {
    const likes = await prisma.like.findMany({
      include: {
        user: true,
      },
    });

    const likes_Json = JSON.parse(JSON.stringify(likes));
    const jsonPosts = JSON.parse(JSON.stringify(allPosts));

    return {
      props: {
        session,
        likes_Json,
        jsonPosts
      },
    };
  }
}
