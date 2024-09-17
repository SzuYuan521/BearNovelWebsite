import React, { createContext, useState, useContext, useCallback } from "react";
import GlobalModel from "../components/GlobalModel";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    context: "",
    onButtonClick: () => {},
    hasCancel: false,
  });

  const openModal = useCallback(
    (title, context, onButtonClick, hasCancel = false) => {
      setModalState({
        isOpen: true,
        title,
        context,
        onButtonClick,
        hasCancel,
      });
    },
    []
  );

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
        hasCancel={modalState.hasCancel}
      />
    </ModalContext.Provider>
  );
};

// 自定義 Hook 用來使用 Context
export const useModal = () => useContext(ModalContext);
