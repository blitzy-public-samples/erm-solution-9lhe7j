import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useFetch } from 'src/shared/hooks/index';
import { API_BASE_URL } from 'src/shared/constants/index';
import Button from 'src/frontend/components/common/Button';
import Input from 'src/frontend/components/common/Input';
import Select from 'src/frontend/components/common/Select';
import Modal from 'src/frontend/components/common/Modal';

// Styled components
const BuilderContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
`;

const BuilderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const BuilderContent = styled.div`
  display: flex;
  flex: 1;
  gap: 1rem;
`;

const ElementsPanel = styled.div`
  width: 250px;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
`;

const CanvasArea = styled.div`
  flex: 1;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
`;

const ConfigPanel = styled.div`
  width: 300px;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
`;

// Interfaces
interface ReportBuilderProps {
  onSave: (reportConfig: ReportConfig) => void;
  onCancel: () => void;
  initialConfig: ReportConfig | null;
}

interface ReportConfig {
  name: string;
  description: string;
  elements: ReportElement[];
  filters: ReportFilter[];
  layout: ReportLayout;
}

interface ReportElement {
  id: string;
  type: string;
  name: string;
  dataSource: string;
}

interface ReportFilter {
  field: string;
  operator: string;
  value: string;
}

interface ReportLayout {
  columns: number;
  rows: number;
  elementPositions: { [elementId: string]: { x: number; y: number; width: number; height: number } };
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({ onSave, onCancel, initialConfig }) => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>(
    initialConfig || {
      name: '',
      description: '',
      elements: [],
      filters: [],
      layout: { columns: 2, rows: 2, elementPositions: {} },
    }
  );

  const { data: availableElements, error: elementsError } = useFetch<ReportElement[]>(
    `${API_BASE_URL}/report-elements`
  );

  const { data: dataSources, error: dataSourcesError } = useFetch<string[]>(
    `${API_BASE_URL}/data-sources`
  );

  useEffect(() => {
    if (elementsError || dataSourcesError) {
      // Handle errors
      console.error('Error fetching report builder data:', elementsError || dataSourcesError);
    }
  }, [elementsError, dataSourcesError]);

  const handleDragEnd = (result: any) => {
    // Implement drag and drop logic here
  };

  const handleSave = () => {
    // Validate report configuration
    if (!reportConfig.name) {
      alert('Please enter a report name');
      return;
    }

    // Save report configuration
    onSave(reportConfig);
  };

  const handleElementSelect = (element: ReportElement) => {
    // Add selected element to the report configuration
    setReportConfig((prevConfig) => ({
      ...prevConfig,
      elements: [...prevConfig.elements, element],
    }));
  };

  const handleFilterAdd = (filter: ReportFilter) => {
    // Add new filter to the report configuration
    setReportConfig((prevConfig) => ({
      ...prevConfig,
      filters: [...prevConfig.filters, filter],
    }));
  };

  const handleLayoutChange = (newLayout: ReportLayout) => {
    // Update layout in the report configuration
    setReportConfig((prevConfig) => ({
      ...prevConfig,
      layout: newLayout,
    }));
  };

  return (
    <BuilderContainer>
      <BuilderHeader>
        <Input
          value={reportConfig.name}
          onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
          placeholder="Enter report name"
        />
        <div>
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={onCancel}>Cancel</Button>
        </div>
      </BuilderHeader>
      <BuilderContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <ElementsPanel>
            <h3>Available Elements</h3>
            <Droppable droppableId="elements">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {availableElements?.map((element, index) => (
                    <Draggable key={element.id} draggableId={element.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {element.name}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </ElementsPanel>
          <CanvasArea>
            <h3>Report Layout</h3>
            <Droppable droppableId="canvas">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {/* Implement canvas layout here */}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </CanvasArea>
        </DragDropContext>
        <ConfigPanel>
          <h3>Configuration</h3>
          {/* Implement element configuration and filter management here */}
        </ConfigPanel>
      </BuilderContent>
    </BuilderContainer>
  );
};

export default ReportBuilder;