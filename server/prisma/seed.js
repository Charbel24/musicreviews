const prisma = require("../db");
const bcrypt = require('bcrypt');


async function main() {
  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.album.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: passwordHash,
        isAdmin: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: passwordHash,
      },
    }),
  ]);

  // Create albums
  const albums = await Promise.all([
    prisma.album.create({
      data: {
        title: 'To Pimp a Butterfly',
        artist: 'Kendrick Lamar',
        year: 2015,
        genre: 'Hip-Hop',
        imageUrl: "https://img.merchbar.com/product/194/7952/7679308824834/cgpK3fJi0602547300683.jpg?q=40&w=768"
      },
    }),
    prisma.album.create({
      data: {
        title: 'Thriller',
        artist: 'Michael Jackson',
        year: 1982,
        genre: 'Pop',
        imageUrl: "https://img.merchbar.com/product/crop/1616/355888/2CE5NN-1716496461-1280x1280-1716496456-Mj.jpg?q=40&w=768"
      },
    }),
    prisma.album.create({
      data: {
        title: 'Back in Black',
        artist: 'AC/DC',
        year: 1980,
        genre: 'Hard Rock',
        imageUrl: "https://img.merchbar.com/product/crop/1616/194918/UTJ7SH-1720716736-1500x1500-1671474620-696998020719-4.jpg?q=40&w=768"
      },
    }),
    prisma.album.create({
      data: {
        title: 'Kind of Blue',
        artist: 'Miles Davis',
        year: 1959,
        genre: 'Jazz',
        imageUrl:"https://img.merchbar.com/product/crop/1616/194919/DRAR55-1690390878-900x900-1690390874-kind-of-blue-hq-180-gram.jpg?q=40&w=768"
      },
    }),
    prisma.album.create({
      data: {
        title: '21',
        artist: 'Adele',
        year: 2011,
        genre: 'Pop',
        imageUrl:"https://img.merchbar.com/albums/releases/14093916.jpeg?q=40&w=768"
      },
    }),
  ]);

  // Create reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        content: 'A timeless masterpiece. The soundscapes are incredible.',
        rating: 5,
        userId: users[0].id,
        albumId: albums[0].id,
      },
    }),
    prisma.review.create({
      data: {
        content: 'One of the best-selling albums of all time for a reason.',
        rating: 5,
        userId: users[1].id,
        albumId: albums[1].id,
      },
    }),
    prisma.review.create({
      data: {
        content: 'Raw energy and powerful riffs. A classic rock album.',
        rating: 4,
        userId: users[2].id,
        albumId: albums[2].id,
      },
    }),
    prisma.review.create({
      data: {
        content: 'Adele\'s voice is haunting and beautiful.',
        rating: 5,
        userId: users[0].id,
        albumId: albums[3].id,
      },
    }),
    prisma.review.create({
      data: {
        content: 'The definitive jazz album. Every note is perfect.',
        rating: 5,
        userId: users[1].id,
        albumId: albums[4].id,
      },
    }),
  ]);

  // Create comments
  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'I completely agree! The guitar work is phenomenal.',
        userId: users[1].id,
        reviewId: reviews[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Thriller is my favorite track from this album.',
        userId: users[2].id,
        reviewId: reviews[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'I prefer their earlier work, but this is still great.',
        userId: users[0].id,
        reviewId: reviews[2].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Her voice gives me chills every time I listen.',
        userId: users[2].id,
        reviewId: reviews[3].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'A true jazz masterpiece. Miles Davis was a genius.',
        userId: users[0].id,
        reviewId: reviews[4].id,
      },
    }),
  ]);

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });