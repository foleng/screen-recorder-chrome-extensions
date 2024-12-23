import React, { useEffect, useRef, useState } from 'react';
import { Layout, Menu, Button, Divider } from 'antd';
import { PlayCircleOutlined, DownloadOutlined, EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { getVideo } from '@/extensions/storage';
import styles from "./index.less";

const { Header, Content, Footer, Sider } = Layout;

const LayoutComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    // 假设最新的视频 ID 是 1，实际使用时需要获取正确的 ID
    const loadVideo = async () => {
      const url = await getVideo(1);
      if (url) {
        setVideoUrl(url);
      }
    };
    loadVideo();

    // 清理函数
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);

  const menuItems = [
    {
      title: '编辑',
      items: [
        { label: '编辑视频', icon: <EditOutlined /> },
        { label: '裁剪', icon: <EditOutlined /> },
        { label: '添加音频', icon: <EditOutlined /> },
      ],
    },
    {
      title: '保存',
      items: [{ label: '登录并保存到 Drive', icon: <PlayCircleOutlined /> }],
    },
    {
      title: '导出',
      items: [
        { label: '下载为 .mp4', icon: <DownloadOutlined /> },
        { label: '下载为 .webm', icon: <DownloadOutlined /> },
      ],
    },
    {
      title: '高级',
      items: [
        { label: '下载视频和源文件', icon: <DownloadOutlined /> },
        { label: '报告相关的编码和特性问题', icon: <QuestionCircleOutlined /> },
      ],
    },
  ];

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.logo}>Screenity</div>
        <div className={styles.title}>
          {videoUrl ? 'Recording Preview' : 'No video available'}
        </div>
        <div className={styles.actions}>
          <Button type="link" className={styles.actionButton}>帮助中心</Button>
          <Button type="primary" className={styles.actionButton}>关注更新</Button>
        </div>
      </Header>

      <Layout>
        <Sider width={250} className={styles.sider}>
          {menuItems.map((menu, index) => (
            <div key={index} className={styles.menuSection}>
              <Divider orientation="left">{menu.title}</Divider>
              <Menu
                mode="vertical"
                items={menu.items.map((item, idx) => ({
                  key: `${menu.title}-${idx}`,
                  icon: item.icon,
                  label: item.label,
                }))}
              />
            </div>
          ))}
        </Sider>

        <Layout>
          <Content className={styles.content}>
            <div className={styles.videoPlayer}>
              <div className={styles.video}>
                {videoUrl ? (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className={styles.videoElement}
                  />
                ) : (
                  <span className={styles.loading}>Loading video...</span>
                )}
              </div>
            </div>
            <p className={styles.videoTitle}>
              {videoUrl ? 'Recording Preview' : 'No video available'}
            </p>
          </Content>
        </Layout>
      </Layout>

      <Footer className={styles.footer}>
        <Button shape="circle" icon={<QuestionCircleOutlined />} />
      </Footer>
    </Layout>
  );
};

export default LayoutComponent;
