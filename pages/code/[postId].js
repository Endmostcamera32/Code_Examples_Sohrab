import { prisma } from "../../server/db/client";
import PostComponent from "../../components/Post/index";
import { useSession, signIn, signOut } from "next-auth/react";
import Comments from "../../components/Comments";
import CommentForm from "../../components/CommentForm/index";
import axios from "axios";
import { useEffect, useState } from "react";

// pages/posts/[id].js

// Generates `/posts/1` and `/posts/2`
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking", // can also be true or 'blocking'
  };
}

// `getStaticPaths` requires using `getStaticProps`
export async function getStaticProps(context) {
  const thePost = await prisma.post.findUnique({
    where: {
      postId: context.params.postId,
    },
    include: {
      comments: true,
      likes: true,
      user: true,
    },
  });

  const comments = await prisma.comment.findMany({
    where: {
      postId: context.params.postId,
    },
    include: {
      user: true,
    },
  });

  let howManyComments = thePost.comments.length;
  thePost.totalComments = howManyComments;
  let howManyLikes = thePost.likes.length;
  thePost.totalLikes = howManyLikes;

  const thePost_Json = JSON.parse(JSON.stringify(thePost));
  const comments_Json = JSON.parse(JSON.stringify(comments));

  return {
    // Passed to the page component as props
    props: {
      id: context.params.postId,
      postData: thePost_Json,
      comments: comments_Json,
    },
  };
}

export default function Post({ id }) {
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    (async () => {
      await axios
        .post("/api/getSinglePostComments", { postId: id })
        .then((res) => {
          // console.log(res)
          setComments(res.data.comments_Json);
          setPost(res.data.thePost_Json);
        });
    })();
  }, []);

  async function handleOnLike(liked) {
    if (session) {
      console.log(liked);
      if (!liked.liked) {
        await axios
          .post("/api/removeLike", {
            email: session.user.email,
            postId: liked.postId,
          })
          .then((res) => {
            res.data.map(m => {
              if (m.postId == post.postId) {
                setPost(m)
              }
            })
            // setPost(res.data);
          });
      } else {
        await axios
          .put("/api/removeLike", {
            email: session.user.email,
            postId: liked.postId,
          })
          .then((res) => {
            console.log(res.data)
            res.data.map(m => {
              if (m.postId == post.postId) {
                setPost(m)
              }
            })
          });
      }
    } else {
      router.push("/api/auth/signin");
    }
  }

  async function handleGoToPost(m) {
    router.push(`/code/${m.postId}`);
  }

  if (!session) {
    return (
      <>
        <PostComponent
          user={post.user}
          post={post}
          onComment={handleGoToPost}
          onLike={handleOnLike}
        />
        <Comments comments={comments} />
      </>
    );
  } else {
    async function handleSubmit({ comment }) {
      // console.log(session.user)
      await axios
        .post("/api/addComment", {
          inputText: comment,
          user: post.user,
          postId: post.postId,
        })
        .then((res) => {
          console.log(res);
        });

      await axios
        .post("/api/getSinglePostComments", { postId: id })
        .then((res) => {
          setComments(res.data.comments_Json);
          setPost(res.data.thePost_Json);
        });
    }

    return (
      <>
        <PostComponent
          user={session.user}
          post={post}
          onComment={handleGoToPost}
          onLike={handleOnLike}

        />
        <CommentForm onSubmit={handleSubmit} user={session.user} />
        <Comments comments={comments} />
      </>
    );
  }
}
