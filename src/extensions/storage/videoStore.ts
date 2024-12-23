import db from './db';

// 添加视频
export async function addVideo(videoFile: File | Blob): Promise<void> {
    const videoBlob = await videoFile.arrayBuffer();
    await db.table('videos').add({
        name: videoFile instanceof File ? videoFile.name : 'recording.webm',
        videoBlob: videoBlob
    });
    console.log('视频已保存:', videoFile instanceof File ? videoFile.name : 'recording.webm');
}

// 获取视频
export async function getVideo(id: number) {
    const videoData = await db.table('videos').get(id);
    if (videoData) {
        const blob = new Blob([videoData.videoBlob], { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(blob);
        return videoUrl;
    } else {
        console.log('未找到视频');
        return null;
    }
}

// 获取最新的视频
export async function getLatestVideo() {
    const videos = await db.table('videos').toArray();
    const latestVideo = videos[videos.length - 1];
    if (latestVideo) {
        const blob = new Blob([latestVideo.videoBlob], { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        return videoUrl;
    }
    return null;
}
