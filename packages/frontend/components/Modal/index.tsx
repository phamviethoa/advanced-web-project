import ReactModal from 'react-modal';

type Props = {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  handleCloseModal: () => void;
};

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const Modal = ({ isOpen, title, children, handleCloseModal }: Props) => {
  const closeModal = () => handleCloseModal();

  return (
    <ReactModal style={customStyles} ariaHideApp={false} isOpen={isOpen}>
      <div className="container">
        <div className="d-flex align-items-baseline justify-content-between mb-3 border-bottom pb-3">
          <h2 className="h5 me-5">{title}</h2>
          <a onClick={closeModal}>
            <i className="d-block fas fa-times"></i>
          </a>
        </div>
        <div className="row">{children}</div>
      </div>
    </ReactModal>
  );
};

export default Modal;
