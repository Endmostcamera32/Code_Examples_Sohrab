import { prisma } from "../../../server/db/client";

export default async function handler(req, res) {
  if (req.method == "POST") {
    const thePost = await prisma.post.findUnique({
      where: {
        postId: req.body.postId,
      },
      include: {
        comments: true,
        likes: true,
        user: true,
      },
    });

    const comments = await prisma.comment.findMany({
      where: {
        postId: thePost.postId,
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

    res.status(200).json({ thePost_Json, comments_Json });
    return;
  }
}
