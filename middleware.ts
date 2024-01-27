import { NextResponse } from "next/server";
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/api/:path*"],
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
 

// const allowedOrigins = process.env.NODE_ENV === 'production' ? [''] : ['http://localhost:3001']

// export function middleware(req: Request) {
//   const origin = req.headers.get('origin')
//   console.log(origin)

//   if (origin && !allowedOrigins.includes(origin)) {
//     return new NextResponse(null, {
//       status: 400,
//       statusText: "Bad Request",
//       headers: {
//         'Content-Type': 'text/plain'
//       }
//     })
//   }

//   return NextResponse.next()
// }


// export default authMiddleware({
//   publicRoutes: ["/api/:path*"],
// });

// export const config = {
//   matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
// };

// export const config = {
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };

// export default authMiddleware({});

// export const config = {
//   matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
// };