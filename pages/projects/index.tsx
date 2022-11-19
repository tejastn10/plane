import React, { useEffect, useState } from "react";
// next
import type { NextPage } from "next";
// hooks
import useUser from "lib/hooks/useUser";
// layouts
import ProjectLayout from "layouts/ProjectLayout";
// components
import CreateProjectModal from "components/project/CreateProjectModal";
import ConfirmProjectDeletion from "components/project/ConfirmProjectDeletion";
// ui
import { Button, Spinner } from "ui";
// types
import { IProject } from "types";
// services
import projectService from "lib/services/project.service";
import ProjectMemberInvitations from "components/project/memberInvitations";
import { ClipboardDocumentListIcon, PlusIcon } from "@heroicons/react/24/outline";
import { BreadcrumbItem, Breadcrumbs } from "ui/Breadcrumbs";
import { EmptySpace, EmptySpaceItem } from "ui/EmptySpace";
import HeaderButton from "ui/HeaderButton";

const Projects: NextPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteProject, setDeleteProject] = useState<IProject | undefined>();
  const [invitationsRespond, setInvitationsRespond] = useState<string[]>([]);

  const { projects, activeWorkspace, mutateProjects } = useUser();

  const handleInvitation = (project_invitation: any, action: "accepted" | "withdraw") => {
    if (action === "accepted") {
      setInvitationsRespond((prevData) => {
        return [...prevData, project_invitation.id];
      });
    } else if (action === "withdraw") {
      setInvitationsRespond((prevData) => {
        return prevData.filter((item: string) => item !== project_invitation.id);
      });
    }
  };

  const submitInvitations = () => {
    projectService
      .joinProject((activeWorkspace as any)?.slug, { project_ids: invitationsRespond })
      .then(async (res: any) => {
        console.log(res);
        setInvitationsRespond([]);
        await mutateProjects();
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (isOpen) return;
    const timer = setTimeout(() => {
      setDeleteProject(undefined);
      clearTimeout(timer);
    }, 300);
  }, [isOpen]);

  return (
    <ProjectLayout>
      <CreateProjectModal isOpen={isOpen && !deleteProject} setIsOpen={setIsOpen} />
      <ConfirmProjectDeletion
        isOpen={isOpen && !!deleteProject}
        setIsOpen={setIsOpen}
        data={deleteProject}
      />
      {projects ? (
        <>
          <div className="flex flex-col items-center justify-center w-full h-full px-2">
            <div className="w-full h-full flex flex-col space-y-5 pb-10">
              {projects.length === 0 ? (
                <div className="w-full h-full flex flex-col justify-center items-center px-4">
                  <EmptySpace
                    title="You don't have any project yet."
                    description="Projects are a collection of issues. They can be used to represent the development work for a product, project, or service."
                    Icon={ClipboardDocumentListIcon}
                  >
                    <EmptySpaceItem
                      title="Create a new project"
                      description={
                        <span>
                          Use{" "}
                          <pre className="inline bg-gray-100 px-2 py-1 rounded">
                            Ctrl/Command + P
                          </pre>{" "}
                          shortcut to create a new project
                        </span>
                      }
                      Icon={PlusIcon}
                      action={() => setIsOpen(true)}
                    />
                  </EmptySpace>
                </div>
              ) : (
                <>
                  <Breadcrumbs>
                    <BreadcrumbItem title={`${activeWorkspace?.name} Projects`} />
                  </Breadcrumbs>
                  <div className="flex items-center justify-between cursor-pointer w-full">
                    <h2 className="text-2xl font-medium">Projects</h2>
                    <HeaderButton
                      Icon={PlusIcon}
                      label="Add Project"
                      action={() => setIsOpen(true)}
                    />
                  </div>
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projects.map((item) => (
                        <ProjectMemberInvitations
                          key={item.id}
                          project={item}
                          slug={(activeWorkspace as any).slug}
                          invitationsRespond={invitationsRespond}
                          handleInvitation={handleInvitation}
                          setDeleteProject={setDeleteProject}
                        />
                      ))}
                    </div>
                    {invitationsRespond.length > 0 && (
                      <div className="flex justify-between mt-4">
                        <Button onClick={submitInvitations}>Submit</Button>
                      </div>
                    )}
                  </>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex justify-center items-center">
          <Spinner />
        </div>
      )}
    </ProjectLayout>
  );
};

export default Projects;
