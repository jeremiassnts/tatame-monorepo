import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase";

export class AttachmentsService {
    private supabase: SupabaseClient;
    constructor(accessToken: string) {
        this.supabase = (new SupabaseService(accessToken)).getClient();
    }
    // const uploadImage = useMutation({
    //     mutationFn: async (image: string) => {
    //       if (!image) return;
    //       const formData = new FormData();

    //       const filename = image.split("/").pop();
    //       const match = /\.(\w+)$/.exec(filename ?? "");
    //       const ext = match?.[1];
    //       const mimeType = ext ? `image/${ext}` : `image`;

    //       formData.append("file", {
    //         uri: image,
    //         name: filename,
    //         type: mimeType,
    //       } as any);
    //       const response = await axiosClient.post<{ url: string }>(
    //         "/attachment-image",
    //         formData,
    //         {
    //           headers: {
    //             "Content-Type": "multipart/form-data",
    //             Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
    //           },
    //         },
    //       );
    //       return response.data.url;
    //     },
    //   });

    //   const uploadVideo = useMutation({
    //     mutationFn: async (video: string) => {
    //       if (!video) return;
    //       const formData = new FormData();

    //       const filename = video.split("/").pop();
    //       const match = /\.(\w+)$/.exec(filename ?? "");
    //       const ext = match?.[1];
    //       const mimeType = ext ? `video/${ext}` : `video`;

    //       formData.append("file", {
    //         uri: video,
    //         name: filename,
    //         type: mimeType,
    //       } as any);
    //       const response = await axiosClient.post<{ url: string }>(
    //         "/attachment-video",
    //         formData,
    //         {
    //           headers: {
    //             "Content-Type": "multipart/form-data",
    //             Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
    //           },
    //         },
    //       );
    //       return response.data.url;
    //     },
    //   });

    //   const updateUserImage = useMutation({
    //     mutationFn: async (props: { image: string; userId: string }) => {
    //       const { image, userId } = props;
    //       if (!image) return;
    //       const formData = new FormData();

    //       const filename = image.split("/").pop();
    //       const match = /\.(\w+)$/.exec(filename ?? "");
    //       const ext = match?.[1];
    //       const mimeType = ext ? `image/${ext}` : `image`;

    //       formData.append("file", {
    //         uri: image,
    //         name: filename,
    //         type: mimeType,
    //       } as any);
    //       const response = await axiosClient.post<{ image_url: string }>(
    //         `/clerk-update-profile-image/${userId}`,
    //         formData,
    //         {
    //           headers: {
    //             "Content-Type": "multipart/form-data",
    //             Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
    //           },
    //         },
    //       );
    //       await supabase
    //         .from("users")
    //         .update({ profile_picture: response.data.image_url })
    //         .eq("clerk_user_id", userId);
    //       return response.data;
    //     },
    //   });
}