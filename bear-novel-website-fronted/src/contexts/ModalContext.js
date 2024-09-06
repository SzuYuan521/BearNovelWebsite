import React, { createContext, useState, useContext } from "react";
import GlobalModel from "../components/GlobalModel";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    context: "",
    onButtonClick: () => {},
  });

  const openModal = (title, context, onButtonClick) => {
    setModalState({
      isOpen: true,
      title,
      context,
      onButtonClick,
    });
  };

  const closeModal = () => {
    setModalState({
      ...modalState,
      isOpen: false,
    });
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <GlobalModel
        isOpen={modalState.isOpen}
        onRequestClose={closeModal}
        title={modalState.title}
        context={modalState.context}
        onButtonClick={() => {
          modalState.onButtonClick();
          closeModal();
        }}
      />
    </ModalContext.Provider>
  );
};

// 自定義 Hook 用來使用 Context
export const useModal = () => useContext(ModalContext);
