import reviewService from 'api/review';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import Layout from 'components/Layout';
import {
  Typography,
  Descriptions,
  Space,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  Divider,
  Comment,
  Avatar,
  Tooltip,
} from 'antd';
import { ReviewStatus } from 'types/grade.dto';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { CheckCircleTwoTone } from '@ant-design/icons';
import useUser from 'hooks/useUser';
import { UserRole } from 'types/user.dto';
import commentService from 'api/comment';
import { CommentDto } from 'types/comment.dto';
import moment from 'moment';
const { Title, Text } = Typography;
const { TextArea } = Input;

type GradeReview = {
  id: string;
  status: ReviewStatus;
  expectation: number;
  explanation: string;
  grade: {
    assignment: {
      name: string;
    };
    point: number;
    student: {
      fullName: string;
      identity: string;
    };
  };
  comments: any;
};

const ReviewDetail = () => {
  const router = useRouter();
  const classroomId = router.query.id as string;
  const reviewId = router.query.reviewId as string;

  const user = useUser(classroomId as string);

  const [isOpenCloseReviewModal, setIsOpenCloseReviewModal] =
    useState<boolean>(false);
  const openCloseReviewModal = () => setIsOpenCloseReviewModal(true);
  const closeCloseReviewModal = () => setIsOpenCloseReviewModal(false);

  const { data: review } = useQuery(['review', reviewId], () =>
    reviewService.getReview({ reviewId, classroomId })
  );

  const data = review as unknown as GradeReview;

  const comments: CommentDto[] = data?.comments.map((comment: any) => {
    return {
      name: comment.user.fullName,
      message: comment.message,
      createAt: comment.createdAt,
      authorId: comment.user.id,
    };
  });

  console.log(comments);

  const isStudentCommenter = (id: string) => {
    if (user.role === UserRole.STUDENT) {
      return id === user.id;
    } else {
      return id !== user.id;
    }
  };

  const queryClient = useQueryClient();

  const { mutateAsync: closeReviewMutate } = useMutation(
    reviewService.closeReview,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['review', reviewId]);
        toast.success('Close review successfully.');
      },
      onError: () => {
        toast.error('Close review unsuccessfylly.');
      },
    }
  );

  const { mutateAsync: addCommentMutate } = useMutation(
    commentService.addGradeComment,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['review', reviewId]);
        toast.success('Add comment successfully.');
      },
      onError: () => {
        toast.error('Add comment unsuccessfylly.');
      },
    }
  );

  const [form] = Form.useForm();
  const [commentForm] = Form.useForm();

  const closeReview = ({ grade }: any) => {
    closeCloseReviewModal();
    form.resetFields();
    closeReviewMutate({ grade: +grade, classroomId, reviewId });
  };

  const addComment = ({ message }: any) => {
    commentForm.resetFields();
    addCommentMutate({ reviewId, message });
  };

  const Editor = () => (
    <Form form={commentForm} onFinish={addComment}>
      <Form.Item name="message">
        <TextArea />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Add Comment
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <Layout>
      <Modal
        title="Close Review"
        visible={isOpenCloseReviewModal}
        onCancel={closeCloseReviewModal}
        footer={[
          <Button key="back" onClick={closeCloseReviewModal}>
            Close
          </Button>,
          <Button key="submit" onClick={form.submit} type="primary">
            Close Review
          </Button>,
        ]}
      >
        <div>
          <Form
            name="basic"
            form={form}
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={closeReview}
            autoComplete="off"
          >
            <Form.Item
              label="Final Grade"
              name="grade"
              rules={[
                {
                  required: true,
                  message: 'Final grade is required.',
                },
                {
                  pattern: new RegExp(/^[0-9]+$/),
                  message: 'Fial grade is number.',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <div>
        <Space direction="vertical" size="large">
          <Row justify="space-between">
            <Col>
              <Title level={2}>Grade Review</Title>
            </Col>
            <Col>
              {data?.status === ReviewStatus.ACTIVE ? (
                user.role === UserRole.TEACHER ? (
                  <Button onClick={openCloseReviewModal} type="primary">
                    Close Review
                  </Button>
                ) : (
                  <Space>
                    <Text type="danger" strong={true}>
                      Active
                    </Text>
                  </Space>
                )
              ) : (
                <Space>
                  <Text type="success" strong={true}>
                    Resolved
                  </Text>
                  <CheckCircleTwoTone twoToneColor="#52c41a" />
                </Space>
              )}
            </Col>
          </Row>
          <div>
            <Space direction="vertical" size="middle">
              <Descriptions title="Student Info">
                <Descriptions.Item label="Identity">
                  {data?.grade.student.identity}
                </Descriptions.Item>
                <Descriptions.Item label="Full Name">
                  {data?.grade.student.fullName}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions title="Review Info">
                <Descriptions.Item label="Grade Composition">
                  {data?.grade.assignment.name}
                </Descriptions.Item>
                <Descriptions.Item label="Current Grade">
                  {data?.grade.point}
                </Descriptions.Item>
                <Descriptions.Item label="Expected Grade">
                  {data?.expectation}
                </Descriptions.Item>
                <Descriptions.Item label="Explanation">
                  {data?.explanation}
                </Descriptions.Item>
              </Descriptions>
              <Divider orientation="left">Comments</Divider>
              <Row>
                <Col span={12}>
                  <Comment
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor:
                            user.role === UserRole.TEACHER
                              ? '#f56a00'
                              : '#7265e6',
                          verticalAlign: 'middle',
                        }}
                        size="large"
                        gap={4}
                      >
                        {user && user.name && user.name[0].toUpperCase()}
                      </Avatar>
                    }
                    content={<Editor />}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  {comments
                    ?.sort((a, b) => {
                      if (a.createAt && b.createAt) {
                        return (
                          moment(a.createAt).valueOf() -
                          moment(b.createAt).valueOf()
                        );
                      } else {
                        return 0;
                      }
                    })
                    .map((comment, index) => (
                      <Comment
                        key={index}
                        author={<a>{comment.name}</a>}
                        avatar={
                          <Avatar
                            style={{
                              backgroundColor: !isStudentCommenter(
                                comment.authorId
                              )
                                ? '#f56a00'
                                : '#7265e6',
                              verticalAlign: 'middle',
                            }}
                            size="large"
                            gap={4}
                          >
                            {comment.name[0].toUpperCase()}
                          </Avatar>
                        }
                        content={<p>{comment.message}</p>}
                        datetime={
                          <Tooltip
                            title={moment(moment.utc(comment.createAt))
                              .local()
                              .format('YYYY-MM-DD HH:mm:ss')}
                          >
                            <span>
                              {moment(moment.utc(comment.createAt))
                                .local()
                                .fromNow()}
                            </span>
                          </Tooltip>
                        }
                      />
                    ))}
                </Col>
              </Row>
            </Space>
          </div>
        </Space>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const classroomId = params?.id as string;
  const reviewId = params?.reviewId as string;
  const queryClient = new QueryClient();

  Promise.all([
    queryClient.prefetchQuery(['review', reviewId], () =>
      reviewService.getReview({ reviewId, classroomId })
    ),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default ReviewDetail;
