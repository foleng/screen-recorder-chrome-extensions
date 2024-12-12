import db from './db';

// 添加视频
export async function addVideo(videoFile) {
    const videoBlob = await videoFile.arrayBuffer();
    await db.videos.add({
        name: videoFile.name,
        videoBlob: videoBlob
    });
    console.log('视频已保存:', videoFile.name);
}

// 获取视频
export async function getVideo(id) {
    const videoData = await db.videos.get(id);
    if (videoData) {
        const blob = new Blob([videoData.videoBlob], { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(blob);
        return videoUrl;
    } else {
        console.log('未找到视频');
        return null;
    }
}
