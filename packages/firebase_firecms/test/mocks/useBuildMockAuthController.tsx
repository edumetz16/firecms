// import { useState } from "react";
//
// import { User as FirebaseUser } from "@firebase/auth";
// import { createMockUser } from "./mock_user";
// import { FirebaseAuthController } from "../../src/types";
// import { Role } from "@edumetz16/firecms_user_management";
//
// export function useBuildMockAuthController(): FirebaseAuthController {
//
//     const [user, setUser] = useState<FirebaseUserWrapper | null>(null);
//
//     return {
//         anonymousLogin(): void {
//         },
//         appleLogin(): void {
//         },
//         facebookLogin(): void {
//         },
//         githubLogin(): void {
//         },
//         microsoftLogin(): void {
//         },
//         phoneLogin(phone: string, applicationVerifier): void {
//         },
//         skipLogin(): void {
//         },
//         twitterLogin(): void {
//         },
//         authLoading: false,
//         createUserWithEmailAndPassword(email: string, password: string): void {
//         },
//         emailPasswordLogin(email: string, password: string): void {
//         },
//         fetchSignInMethodsForEmail(email: string): Promise<string[]> {
//             throw new Error("Function not implemented.");
//         },
//         googleLogin(): void {
//             setUser(createMockUser())
//         },
//         setUser(user: FirebaseUser | null): void {
//             setUser(user);
//         },
//         getAuthToken(): Promise<string> {
//             throw new Error("Function not implemented.");
//         },
//         loginSkipped: false,
//         signOut(): void {
//             setUser(null);
//         },
//         user
//     };
// }
