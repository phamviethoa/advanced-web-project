import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AssignemtDto } from 'types/assignment.dto';
import { ClassroomDto } from 'types/classroom.dto';

type Props = {
  classroom: ClassroomDto;
  assignments: AssignemtDto[];
  onOpenUpdateAssginmentModal: () => void;
  onHandleOnDragEnd: (result: any) => Promise<void>;
  onGetInviteStudentLink: () => void;
};

const ClassroomNews = ({
  classroom,
  assignments,
  onOpenUpdateAssginmentModal: openUpdateAssignmentModal,
  onHandleOnDragEnd: handleOnDragEnd,
  onGetInviteStudentLink: getInviteStudentLink,
}: Props) => {
  return (
    <div>
      <div className="row">
        <div className="bg-primary p-5 rounded shadow-sm text-white mb-3">
          <h2 className="h2">{classroom.subject}</h2>
          <p>{classroom.description}</p>
        </div>
      </div>
      <div className="row">
        <div className="col-3 rounded shadow-sm bg-white p-4 me-3">
          <h2 className="h5 mb-4">
            Assignments
            <a onClick={openUpdateAssignmentModal}>
              <i className="fas fa-pencil-alt d-inline-block ms-3 icon-sm"></i>
            </a>
          </h2>
        </div>
        <div className="col rounded shadow-sm bg-white p-4"></div>
      </div>
    </div>
  );
};

export default ClassroomNews;
