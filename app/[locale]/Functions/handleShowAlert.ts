import { useAlertStore } from "@/store/alert.store";

const { setTitle, setDescription, onOpen } = useAlertStore.getState();

const handleShowAlert = (title: string, description: string) => {
  if (setTitle) setTitle(title);
  if (setDescription) setDescription(description);
  if (onOpen) onOpen();
};

export default handleShowAlert;
