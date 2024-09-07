import React, { createContext, useState, useContext, useCallback } from "react";
import GlobalModel from "../components/GlobalModel";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    context: "",
    onButtonClick: () => {},
  });

  const openModal = useCallback((title, context, onButtonClick) => {
    setModalState({
      isOpen: true,
      title,
      context,
      onButtonClick,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((modalState) => ({
      ...modalState,
      isOpen: false,
    }));
  }, []);

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
