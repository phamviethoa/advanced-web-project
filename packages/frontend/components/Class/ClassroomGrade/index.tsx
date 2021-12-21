import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import { AssignemtDto } from 'types/assignment.dto';
import 'rsuite-table/dist/css/rsuite-table.css';
import { useForm } from 'react-hook-form';
import styles from 'components/Class/ClassroomGrade/index.module.css';
import InlineEdit from '@atlaskit/inline-edit';
import { Dropdown, Popover, Whisper, Tooltip } from 'rsuite';
import { CSSProperties, SyntheticEvent, useMemo, useState } from 'react';
import classApi from 'api/class';
import Link from 'next/link';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { ClassroomDto } from 'types/classroom.dto';
import { StudentInSystemDto } from 'types/student.dto';
import Modal from 'components/Modal';
import { FileWithPath, useDropzone } from 'react-dropzone';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const activeStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

type GradeBoardData = {
  id: string;
  identity: string;
  email: string | undefined;
  fullName: string;
  grades: (number | null)[];
  total: number;
  maxTotal: number;
}[];

const flatten = (studentId: string, assignments: AssignemtDto[]) => {
  const filteredAssignments: AssignemtDto[] = assignments.map((assignment) => ({
    id: assignment.id,
    name: assignment.name,
    maxPoint: assignment.maxPoint,
    grades: assignment.grades.filter((grade) => grade.student.id === studentId),
    isFinalized: assignment.isFinalized,
  }));

  return filteredAssignments.map((assignment) => {
    if (assignment.grades[0]) {
      return assignment.grades[0].point;
    }

    return null;
  });
};

type FormFields = {
  assignments: AssignemtDto[];
};

enum SelectOptionKey {
  DOWNLOAD_GRADE = 'DOWNLOAD_GRADE',
  UPLOAD_GRADE = 'UPLOAD_GRADE',
  MARK_GRADE_FINALIZED = 'MARK_GRADE_FINALIZED',
}

type Props = {
  classroom: ClassroomDto;
};

const ClassroomGrade = ({ classroom }: Props) => {
  const students = classroom.students as StudentInSystemDto[];
  const assignments = classroom.assignments;

  const [isOpenUploadFileModal, setIsOpenUploadFileModal] =
    useState<boolean>(false);

  const openUploadFileModal = () => setIsOpenUploadFileModal(true);
  const closeUploadFileModal = () => setIsOpenUploadFileModal(false);

  const [isOpenUploadGradeModal, setIsOpenUploadGradeModal] =
    useState<boolean>(false);

  const openUploadGradeModal = () => setIsOpenUploadGradeModal(true);
  const closeUploadGradeModal = () => setIsOpenUploadGradeModal(false);

  const queryClient = useQueryClient();

  const { handleSubmit, register, watch } = useForm<FormFields>({
    defaultValues: {
      assignments,
    },
  });

  const dataList: GradeBoardData = students.map(
    ({ identity, id, fullName, user }) => {
      const grades: (number | null)[] = flatten(id as string, assignments);
      const total: number =
        grades.reduce((total, grade) => {
          if (grade !== null) {
            return (total || 0) + grade;
          }

          return total;
        }, 0) || 0;

      const maxTotal: number = assignments.reduce(
        (maxTotal, assignment) => maxTotal + assignment.maxPoint,
        0
      );

      return {
        id: id as string,
        identity,
        fullName,
        email: user?.email,
        grades,
        total,
        maxTotal,
      };
    }
  );

  const downloadAssignmentGradeTemplate = (assignmentId: string) => {
    console.log(
      `downloading grade template for assignment ${assignmentId} ...`
    );
  };

  const markAssignmentAsFinalized = (assignmentId: string) => {
    markAssignmentFinalizedMutate(assignmentId);
  };

  const handleClickUploadGrade = (assignmentId: string) => {
    console.log('id: ', assignmentId);
    openUploadGradeModal();
    setUpdateAssignmentId(assignmentId);
  };

  const triggerHandleSelectAssignmentOptions = () => ({
    [SelectOptionKey.DOWNLOAD_GRADE]: downloadAssignmentGradeTemplate,
    [SelectOptionKey.UPLOAD_GRADE]: handleClickUploadGrade,
    [SelectOptionKey.MARK_GRADE_FINALIZED]: markAssignmentAsFinalized,
  });

  const handleSelectAssignmentOptions =
    (assignmentId: string) =>
    (eventKey: string | undefined, event: SyntheticEvent) => {
      event.stopPropagation();
      triggerHandleSelectAssignmentOptions()[eventKey as SelectOptionKey](
        assignmentId
      );
    };

  const { mutateAsync } = useMutation(classApi.updateGrade, {
    onSuccess: () => {
      queryClient.invalidateQueries(['class', classroom.id]);
      toast.success('Update grade successfully.');
    },
    onError: () => {
      toast.error('Update grade unsuccessfully.');
    },
  });

  const { mutateAsync: uploadStudentListMutate } = useMutation(
    classApi.uploadStudentList,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['class', classroom.id]);
        toast.success('Upload student list successfully.');
      },
      onError: () => {
        toast.error('Upload student list unsuccessfully.');
      },
    }
  );

  const { mutateAsync: uploadAssignmentGradesMutate } = useMutation(
    classApi.uploadAssignmentGrade,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['class', classroom.id]);
        toast.success('Upload assignment grades successfully.');
      },
      onError: () => {
        toast.error('Upload assignment grades unsuccessfully.');
      },
    }
  );

  const { mutateAsync: markAssignmentFinalizedMutate } = useMutation(
    classApi.markAssignmentFinalized,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['class', classroom.id]);
        toast.success('Mark assignment finalized successfully.');
      },
      onError: () => {
        toast.error('Mark assignment finalized unsuccessfully.');
      },
    }
  );

  const [updateAssignmentId, setUpdateAssignmentId] = useState<string>('');

  const triggerSubmit = (
    studentId: string,
    assignmentId: string,
    assignmentOrder: number,
    studentOrder: number
  ) => {
    const point = watch(
      `assignments.${assignmentOrder}.grades.${studentOrder}.point` as const
    );

    mutateAsync({ studentId, assignmentId, point: Number(point) });
  };

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    inputRef,
  } = useDropzone();

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  const files = (acceptedFiles as FileWithPath[]).map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const removeAll = () => {
    acceptedFiles.length = 0;
    acceptedFiles.splice(0, acceptedFiles.length);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const uploadStudentList = async () => {
    const file = acceptedFiles[0];
    const formdata = new FormData();
    formdata.append('file', file);

    uploadStudentListMutate({
      classroomId: classroom.id as string,
      studentListFile: formdata,
    });

    removeAll();
  };

  const uploadAssignmentGrade = () => {
    const file = acceptedFiles[0];
    const formdata = new FormData();
    formdata.append('file', file);

    uploadAssignmentGradesMutate({
      assignmentId: updateAssignmentId,
      gradeListFile: formdata,
    });

    removeAll();
  };

  console.log('assignments: ', assignments);

  return (
    <div>
      <Modal
        title="Upload file"
        isOpen={isOpenUploadFileModal}
        handleCloseModal={closeUploadFileModal}
      >
        <div className="p-2">
          <section className="container">
            <div {...getRootProps({ style: style as CSSProperties })}>
              <input {...getInputProps()} />
              <p>Drag drop some files here, or click to select files</p>
            </div>
            <aside>
              <h4>Files</h4>
              <ul>{files}</ul>
            </aside>
          </section>
          <button
            disabled={acceptedFiles.length === 0}
            onClick={() => {
              uploadStudentList();
              closeUploadFileModal();
            }}
            className="btn btn-primary"
          >
            Upload
          </button>
        </div>
      </Modal>
      <Modal
        title="Upload grades"
        isOpen={isOpenUploadGradeModal}
        handleCloseModal={closeUploadGradeModal}
      >
        <div className="p-2">
          <section className="container">
            <div {...getRootProps({ style: style as CSSProperties })}>
              <input {...getInputProps()} />
              <p>Drag drop some files here, or click to select files</p>
            </div>
            <aside>
              <h4>Files</h4>
              <ul>{files}</ul>
            </aside>
          </section>
          <button
            disabled={acceptedFiles.length === 0}
            onClick={() => {
              uploadAssignmentGrade();
              closeUploadGradeModal();
            }}
            className="btn btn-primary"
          >
            Upload
          </button>
        </div>
      </Modal>
      <div className="d-flex justify-content-between">
        <h2 className="text-primary">Grade</h2>
        <div>
          <span className="text-muted me-4">
            <Link
              href={`${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/download-student-list-template`}
            >
              <a target="_blank" className="fw-normal">
                <i
                  style={{ fontSize: '0.8rem' }}
                  className="fas fa-arrow-circle-down me-2"
                ></i>
                Download template
              </a>
            </Link>
          </span>
          <span className="text-muted me-4">
            <a onClick={openUploadFileModal} className="fw-normal">
              <i
                style={{ fontSize: '0.8rem' }}
                className="fas fa-arrow-circle-up me-2"
              ></i>
              Upload template
            </a>
          </span>
          <span className="text-muted">
            <Link
              href={`${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/${classroom.id}/export-grade-board`}
            >
              <a target="_blank" className="fw-normal">
                <i
                  style={{ fontSize: '0.8rem' }}
                  className="fas fa-arrow-circle-down me-2"
                ></i>
                Export grade board
              </a>
            </Link>
          </span>
        </div>
      </div>

      <div className="mt-5 bg-white">
        <form noValidate>
          <Table data={dataList} autoHeight={true} bordered={true}>
            <Column width={100} align="center" fixed>
              <HeaderCell>Identity</HeaderCell>
              <Cell dataKey="identity" />
            </Column>

            <Column width={200} fixed>
              <HeaderCell>Full Name</HeaderCell>
              <Cell>
                {({ fullName, email }) =>
                  email ? (
                    <Whisper
                      placement="top"
                      controlId="control-id-hover"
                      trigger="hover"
                      speaker={<Tooltip>{`email: ${email}`}</Tooltip>}
                    >
                      <span>{fullName}</span>
                    </Whisper>
                  ) : (
                    <span>{fullName}</span>
                  )
                }
              </Cell>
            </Column>

            {assignments
              .sort((a, b) => a.maxPoint - b.maxPoint)
              .map((assignment, order) => (
                <Column width={150} fixed align="center" key={assignment.id}>
                  <HeaderCell>
                    <div className="d-flex align-items-center justify-content-end me-2">
                      <div>
                        <span
                          className={`${
                            assignment.isFinalized && 'text-primary'
                          }`}
                        >
                          {assignment.name}
                        </span>
                      </div>
                      <Whisper
                        placement="autoVerticalStart"
                        trigger="click"
                        speaker={
                          <Popover>
                            <Dropdown.Menu
                              onSelect={handleSelectAssignmentOptions(
                                assignment.id as string
                              )}
                            >
                              <Dropdown.Item
                                eventKey={SelectOptionKey.DOWNLOAD_GRADE}
                              >
                                <Link
                                  href={`${process.env.NEXT_PUBLIC_API_GATEWAY}/classes/download-template-grade`}
                                >
                                  <a target="_blank">Download template</a>
                                </Link>
                              </Dropdown.Item>
                              <Dropdown.Item
                                eventKey={SelectOptionKey.UPLOAD_GRADE}
                              >
                                Upload template
                              </Dropdown.Item>
                              <Dropdown.Item
                                eventKey={SelectOptionKey.MARK_GRADE_FINALIZED}
                              >
                                Mark as finalized
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Popover>
                        }
                      >
                        <i className="fas fa-ellipsis-v text-muted ms-3"></i>
                      </Whisper>
                    </div>
                  </HeaderCell>
                  <Cell>
                    {({ grades, id }, index) => (
                      <InlineEdit
                        defaultValue={grades[order]}
                        editView={() => (
                          <div className="d-flex align-items-center justify-content-end me-2">
                            <div
                              style={{ width: '65px' }}
                              className="border-bottom border-primary"
                            >
                              <input
                                style={{ width: '40px' }}
                                className={`${styles.gradeInput}`}
                                type="text"
                                {...register(
                                  `assignments.${order}.grades.${index}.point` as const
                                )}
                              />
                              <span className="text-muted">{`/${assignment.maxPoint}`}</span>
                            </div>
                            <i className="fas fa-ellipsis-v text-muted ms-3"></i>
                          </div>
                        )}
                        readView={() => (
                          <span>
                            {grades[order] || (
                              <span className="text-muted">empty</span>
                            )}
                          </span>
                        )}
                        onConfirm={() => {
                          triggerSubmit(
                            id,
                            assignment.id as string,
                            order,
                            index
                          );
                        }}
                      />
                    )}
                  </Cell>
                </Column>
              ))}
            <Column flexGrow={1}>
              <HeaderCell>Total</HeaderCell>
              <Cell>
                {({ total, maxTotal }) => (
                  <span className="text-primary">
                    {total}
                    <span className="text-muted">{` / ${maxTotal}`}</span>
                  </span>
                )}
              </Cell>
            </Column>
          </Table>
        </form>
      </div>
    </div>
  );
};

export default ClassroomGrade;
