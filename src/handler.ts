import { notifyChangeMock, fetchWebsiteContent } from "./functions";
import { writeOneToDb } from "./mongodb";

let previousContent = "";

export const monitor = async (): Promise<void> => {
  const currentContent = await fetchWebsiteContent();
  if (!currentContent) return;

  if (currentContent !== previousContent) {
    const changeMessage = `Content changed at ${new Date().toISOString()}`;
    await writeOneToDb({ message: changeMessage });
    await notifyChangeMock(changeMessage);
    previousContent = currentContent;
  }
};
