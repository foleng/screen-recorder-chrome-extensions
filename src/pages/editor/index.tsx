import React from 'react';
import { Layout, Menu, Button, List, Divider } from 'antd';
import { PlayCircleOutlined, DownloadOutlined, EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import styles from "./index.less"

const { Header, Content, Footer, Sider } = Layout;

const LayoutComponent: React.FC = () => {
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
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部导航 */}
      <Header style={{ background: '#f5f5f5', padding: '0 24px' }}>
        <div className="logo" style={{ float: 'left', fontSize: '18px', fontWeight: 'bold' }}>Screenity</div>
        <div style={{ float: 'right' }}>
          <Button type="link" style={{ margin: '0 8px' }}>帮助中心</Button>
          <Button type="primary" style={{ margin: '0 8px' }}>关注更新</Button>
        </div>
      </Header>

      {/* 主内容部分 */}
      <Layout>
        {/* 左侧菜单栏 */}
        <Sider width={250} style={{ background: '#fafafa', padding: '24px' }}>
          {menuItems.map((menu, index) => (
            <div key={index} className="menu-section" style={{ marginBottom: '24px' }}>
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

        {/* 右侧视频内容区域 */}
        <Layout style={{ padding: '0 24px' }}>
          <Content style={{ padding: '24px', background: '#fafafa' }}>
            <div className="video-player" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="video" style={{ width: '80%', maxWidth: '900px', height: '500px', background: '#d9d9d9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#999' }}>视频播放器区域</span>
              </div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '16px' }}>Screenity video - Dec 4, 2024</p>
          </Content>
        </Layout>
      </Layout>

      {/* 底部 */}
      <Footer style={{ textAlign: 'center', background: '#f5f5f5', padding: '16px' }}>
        <Button shape="circle" icon={<QuestionCircleOutlined />} />
      </Footer>
    </Layout>
  );
};

export default LayoutComponent;
