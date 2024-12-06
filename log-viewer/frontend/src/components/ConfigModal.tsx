import * as React from "react";

import { Button, Modal } from "flowbite-react";
import { useNavigate } from "react-router-dom";

export default function ConfigModal({ openModal, setOpenModal }) {
  const navigate = useNavigate();
  return (
    <>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Configure Your First Log</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              To set up your first file to track, please click the button below to be navigated to the Configuration Page.
              In there, you will be able to set the file path, schema, and other discerning details of the files to be tracked.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
        <Button onClick={() => navigate("config")}>
            Go To Config
          </Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Continue without setting up
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}