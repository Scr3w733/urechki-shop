import Modal from './Modal';

export default function InfoModal({ isOpen, onClose, title, text, children }) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>Понятно</button>}
    >
      {children || (text && <p className="muted" style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{text}</p>)}
    </Modal>
  );
}
