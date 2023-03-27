import { prisma } from "../../../server/db/client";

export default async function handler(req, res) {
  if (req.method == "PUT") {
    const onePost = await prisma.post.findUnique({
      where: {
        postId: req.body.postId,
      },
      include: {
        user: true,
        comments: true,
        likes: true,
      },
    });

    const allLikes = await prisma.like.findMany({
      include: {
        user: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    onePost.likes.map(async (m) => {
      if (m.userId == user.id) {
        console.log(m.likeId);
        await prisma.like.delete({
          where: {
            likeId: m.likeId,
          },
        });
      }
    });
    
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
      const user2 = await prisma.user.findUnique({
        where: {
            email: req.body.email,
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


    res.status(200).json(jsonPosts);
    return;
  } else if (req.method == "POST") {
    const onePost = await prisma.post.findUnique({
      where: {
        postId: req.body.postId,
      },
      include: {
        user: true,
        comments: true,
        likes: true,
      },
    });

    const allLikes = await prisma.like.findMany({
      include: {
        user: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    const like = await prisma.like.create({
      data: {
        userId: user.id,
        postId: req.body.postId,
      },
    });

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
    const user2 = await prisma.user.findUnique({
      where: {
        email: req.body.email,
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


    res.status(200).json(jsonPosts);
    return;
  }
}
