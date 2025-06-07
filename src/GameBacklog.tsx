import {
  Input,
  Select,
  Button,
  Typography,
  Card,
  Row,
  Col,
  Form,
  Dropdown,
  Menu,
  Modal,
  Space
} from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from './firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

const { Option } = Select;
const { Title } = Typography;

type Game = {
  id: string;
  title: string;
  status: string;
  image: string;
};

const statusOptions = ['Not Started', 'Playing', 'Completed', 'Dropped'];
const placeholder = 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';

export default function GameBacklog() {
  const [games, setGames] = useState<Game[]>([]);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState(statusOptions[0]);
  const [filterStatus, setFilterStatus] = useState('');
  const [groupByStatus, setGroupByStatus] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editImage, setEditImage] = useState('');

  const gamesRef = collection(db, 'games');

  useEffect(() => {
    const unsubscribe = onSnapshot(gamesRef, (snapshot) => {
      const gameData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Game[];
      setGames(gameData);
    });

    return () => unsubscribe();
  }, []);

  const addGame = async () => {
    if (!title.trim()) return;

    const newGame = {
      title,
      status,
      image: imageUrl || placeholder,
    };

    try {
      await addDoc(gamesRef, newGame);
      setTitle('');
      setImageUrl('');
      setStatus(statusOptions[0]);
    } catch (error) {
      console.error('Error adding game:', error);
    }
  };

  const deleteGame = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'games', id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const openEdit = (game: Game) => {
    setEditGame(game);
    setEditTitle(game.title);
    setEditStatus(game.status);
    setEditImage(game.image);
    setEditModal(true);
  };

  const confirmEdit = async () => {
    if (!editGame) return;
    try {
      await updateDoc(doc(db, 'games', editGame.id), {
        title: editTitle,
        status: editStatus,
        image: editImage || placeholder
      });
      setEditModal(false);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const filteredGames = filterStatus
    ? games.filter((g) => g.status === filterStatus)
    : games;

  const groupedGames = groupByStatus
    ? statusOptions.map((status) => ({
        status,
        games: filteredGames.filter((g) => g.status === status),
      })).filter((group) => group.games.length > 0)
    : [{ status: '', games: filteredGames }];

  const getCardBackground = (status: string) => {
    switch (status) {
      case 'Playing':
        return '#cce4ff';
      case 'Completed':
        return '#ccefd4';
      case 'Dropped':
        return '#ffd4d4';
      case 'Not Started':
      default:
        return '#f0f0f0';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <Card style={{ width: '100%', maxWidth: 1000 }} bodyStyle={{ padding: 24 }} bordered={false}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Games Backlog
        </Title>

        <Form layout="vertical" onFinish={addGame}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item label="Game Title">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter game name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Image URL">
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Optional image URL" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Status">
                <Select value={status} onChange={setStatus}>
                  {statusOptions.map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={2}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" block>
                  Add
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Row gutter={[16, 16]} justify="end" style={{ marginBottom: 24 }}>
          <Col>
            <Select
              value={filterStatus || 'all'}
              onChange={(val) => setFilterStatus(val === 'all' ? '' : val)}
              style={{ width: 180 }}
            >
              <Option value="all">All Statuses</Option>
              {statusOptions.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              value={groupByStatus ? 'status' : 'none'}
              onChange={(val) => setGroupByStatus(val === 'status')}
              style={{ width: 160 }}
            >
              <Option value="none">No Grouping</Option>
              <Option value="status">Group by Status</Option>
            </Select>
          </Col>
        </Row>

        {groupedGames.map(({ status, games }) => (
          <div key={status}>
            {groupByStatus && <Title level={4} style={{ margin: '24px 0 12px' }}>{status}</Title>}
            <AnimatePresence>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {games.map((game) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card hoverable style={{ borderRadius: 12, background: getCardBackground(game.status) }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <img
                          src={game.image || placeholder}
                          alt={game.title}
                          onError={(e) => ((e.target as HTMLImageElement).src = placeholder)}
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                        />
                        <div style={{ flexGrow: 1 }}>
                          <Typography.Title level={5} style={{ margin: 0 }}>
                            {game.title}
                          </Typography.Title>
                          <span style={{ color: '#555' }}>{game.status}</span>
                        </div>
                        <Dropdown
                          overlay={
                            <Menu>
                              <Menu.Item key="edit" onClick={() => openEdit(game)}>
                                Edit
                              </Menu.Item>
                              <Menu.Item key="delete" danger onClick={() => deleteGame(game.id)}>
                                Delete
                              </Menu.Item>
                            </Menu>
                          }
                          trigger={['click']}
                        >
                          <Button type="text" icon={<MoreOutlined />} />
                        </Dropdown>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </Space>
            </AnimatePresence>
          </div>
        ))}

        <Modal
          title="Edit Game"
          open={editModal}
          onOk={confirmEdit}
          onCancel={() => setEditModal(false)}
          okText="Save"
        >
          <Form layout="vertical">
            <Form.Item label="Title">
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </Form.Item>
            <Form.Item label="Status">
              <Select value={editStatus} onChange={setEditStatus}>
                {statusOptions.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Image URL">
              <Input value={editImage} onChange={(e) => setEditImage(e.target.value)} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}
