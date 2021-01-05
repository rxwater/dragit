import React, { Fragment, useEffect, useState } from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Button, Container, IconButton, useTheme } from '@material-ui/core';
import intl from 'react-intl-universal';
import Scrollbar from 'AdminBoard/common/Scrollbar';
import Spacer from 'components/common/Spacer';
import MdiIcon from 'components/common/MdiIcon';
import MouseFollower from './Core/MouseFollower';
import DesignerLayout from 'design/Layout';
import LeftContent from './LeftContent';
import { IPageSchema } from 'base/Model/IPage';
import PageSkeleton from 'AdminBoard/Workspace/common/ModuleSkeleton';
import { IMeta } from 'base/Model/IMeta';
import { RXNodeRoot } from 'base/RXNode/Root';
import { ComponentView } from './Core/ComponentView';
import { RXNode } from 'base/RXNode/RXNode';
import { NodeToolbar } from './Core/NodeToolbar';
import { IToolboxItem } from './Toolbox/IToolboxItem';
import { DragCusor } from './Core/DragCusor';
import { CursorPosition } from './Core/IDragOverParam';
import { SelectedLabel } from './Core/SelectedLabel';
import { cloneObject } from '../../utils/cloneObject';
import SubmitButton from 'components/common/SubmitButton';
import ConfirmDialog from 'base/Widgets/ConfirmDialog';
import { useAuthCheck } from 'store/helpers/useAuthCheck';
import { AUTH_CUSTOMIZE } from 'base/authSlugs';
import { observer } from 'mobx-react-lite';
import { ID } from 'base/Model/graphqlTypes';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { GET_PAGE, SAVE_PAGE } from 'base/GQLs';
import { useShowAppoloError } from 'store/helpers/useInfoError';
import { CanvarsStoreProvider, CanvasStore } from './CanvasStore';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      display: 'flex',
      flexFlow: 'row',
      height:'100%',
    },


    toolboxIcon:{
      marginRight:theme.spacing(2),
    },

    cancelButton:{
      marginRight:theme.spacing(1),
    },
    scrollBar:{
      flex:1,
      display:'flex',
      flexFlow: 'column',
    },

  }),
);

function makeCanvas(){
  return new RXNodeRoot<IMeta>(
    {
      name:'Canvas'
    }
  )
}

export const PageEditor = observer((
  props:{
    pageId:ID,
    onClose:()=>void
  }
) =>{
  const {pageId, onClose} = props;
  const classes = useStyles();
  const [canvasStore] = useState(new CanvasStore());
  const {data, loading, error} = useQuery(GET_PAGE, {variables:{id:pageId}});
  const [savePage, {error:saveError, loading:saving}] = useMutation(SAVE_PAGE);

  const [pageSchema, setPageSchema] = useState<IPageSchema|undefined>(/*pageMeta?.schema*/);
  const [metas, setMetas] = useState<Array<IMeta>>([])
  const [dirty, setIsDirty] = useState(false);
  const [backConfirmOpen, setBackConfirmOpen] = useState(false);

  useShowAppoloError(error||saveError);

  const theme = useTheme(); 

  useAuthCheck(AUTH_CUSTOMIZE);

  useEffect(()=>{
    if(canvasStore.undoList.length > 0 && (canvasStore.redoList.length !== 0 || canvasStore.undoList.length !== 0)){
      setIsDirty(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[canvasStore.undoList])  
  
  const operateNode = (targetNode:RXNode<IMeta>, draggedNode:RXNode<IMeta>, position:CursorPosition)=>{
    if(targetNode.id === draggedNode.id){
      return false;
    }
    if(position === 'in-bottom' || position === 'in-right' || position === 'in-center'){
      draggedNode.moveIn(targetNode);
      return true;        
    }
    if(position === 'in-top' || position === 'in-left'){
      draggedNode.moveInTop(targetNode);
      return true;  
    }
    if(position === 'out-bottom' || position === 'out-right'){
      draggedNode.moveAfter(targetNode);
      return true;  
    }
    if(position === 'out-top' || position === 'out-left'){
      draggedNode.moveBefore(targetNode);
      return true;  
    }
    return false;  
  }

  const handleMouseUp = ()=>{
    if(canvasStore.dragOverParam && (canvasStore.draggedToolboxItem || canvasStore.draggedNode)){
      let targetNode = canvasStore.dragOverParam?.targetNode;
      let dragNode = canvasStore.draggedNode;
      if(!dragNode && canvasStore.draggedToolboxItem?.meta){
        dragNode = RXNode.make<IMeta>(cloneObject(canvasStore.draggedToolboxItem?.meta));
      }
      if(dragNode && targetNode) {
        backupToUndoList(dragNode.id); 
        if(!operateNode(targetNode, dragNode, canvasStore.dragOverParam.position)){
          canvasStore.undoList.pop();
          canvasStore.setUndoList([...canvasStore.undoList]);
        }
        canvasStore.setSelectedNode(dragNode);
      }
    }
    canvasStore.setDragOverParam(undefined);
    canvasStore.setDraggedNode(undefined);
    canvasStore.setDraggedToolboxItem(undefined);
    document.body.classList.remove('can-not-be-selected');
  }

  useEffect(()=>{
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  

  useEffect(() => {
    if(data){
      //setPage(data?.page);
      setPageSchema(cloneObject(data?.page?.schema));
      //相当于复制一个Json副本，不保存的话直接扔掉
      setMetas(cloneObject(data?.page?.schema?.layout || []));      
    }

  },[data]);
 
  useEffect(()=>{
    let newCanvas = makeCanvas();
    newCanvas.parse(metas);
    canvasStore.setCanvas(newCanvas);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[metas])

  const handleCancel = () => {
    if(dirty){
      setBackConfirmOpen(true);
    }
    else{
      canvasStore.reset();
      onClose();
    }
  };

  const handleSave = () => {
    savePage({variables:{page:{
      id:pageId,
      schema:{
        ...pageSchema,
        layout:canvasStore.canvas?.getRootMetas(),
      },
    }
    }})
    setIsDirty(false);    
  };

  const handleBackConfirm = ()=>{
    setBackConfirmOpen(false);
    canvasStore.reset();
    onClose();
  }

  const handleScroll = ()=>{
    canvasStore.scroll();
  }

  const handleStartDragMetas = (item:IToolboxItem)=>{
    canvasStore.setDraggedToolboxItem(item);
    canvasStore.setSelectedNode(undefined);
    document.body.classList.add('can-not-be-selected');
  }

  const backupToUndoList = (operateId:ID|undefined) => {
    canvasStore.setUndoList([...canvasStore.undoList,
    {
      canvasNode: canvasStore.canvas?.copy(),
      pageSchema: cloneObject(pageSchema),
      selectedNodeId: canvasStore.selectedNode?.id || operateId,
    }
    ]);
  }

  const handlePropChange = (propName:string, value:any)=>{
    if(canvasStore.selectedNode){
      backupToUndoList(canvasStore.selectedNode?.id);        
      canvasStore.selectedNode.meta.props = canvasStore.selectedNode.meta.props || {};
      canvasStore.selectedNode.meta.props[propName] = value;
      canvasStore.setSelectedNode(canvasStore.selectedNode);
      canvasStore.setRedoList([]);
      canvasStore.setRefreshNodeId(canvasStore.selectedNode?.id);
    }
  }

  const handlPageChange = (page:IPageSchema)=>{
    backupToUndoList(undefined);
    setPageSchema(page);
  }

  const handleUndo = ()=>{
    let cmd = canvasStore.undoList.pop();
    if(cmd){
      //canvasStore.setUndoList([...canvasStore.undoList]);
      canvasStore.setRedoList([...canvasStore.redoList, 
        {
          canvasNode:canvasStore.canvas?.copy(),
          pageSchema:cloneObject(pageSchema),
          selectedNodeId: cmd.selectedNodeId,
        }
      ]);
      canvasStore.setCanvas(cmd.canvasNode);
      setPageSchema(cmd.pageSchema);
      canvasStore.setSelectedNode(cmd.canvasNode?.getNode(cmd.selectedNodeId));    
    }
  }

  const handleRedo = ()=>{
    let cmd = canvasStore.redoList.pop();
    if(cmd){
      canvasStore.setUndoList([...canvasStore.undoList, 
        {
          canvasNode:canvasStore.canvas?.copy(),
          pageSchema:cloneObject(pageSchema),
          selectedNodeId: cmd.selectedNodeId,
        }
      ]);
      //setRedoList([...redoList]);
      canvasStore.setCanvas(cmd.canvasNode); 
      setPageSchema(cmd.pageSchema);
      canvasStore.setSelectedNode(cmd.canvasNode?.getNode(cmd.selectedNodeId));  
    }    
  }

  const handleClear = ()=>{
    backupToUndoList(undefined);    
    canvasStore.clear();
    canvasStore.setRefreshNodeId(canvasStore.canvas?.id)      
    canvasStore.setSelectedNode(undefined);
    canvasStore.setRedoList([]);
  }

  
  const handleBeginDrag = ()=>{
    canvasStore.setDraggedNode(canvasStore.selectedNode);
    canvasStore.setSelectedNode(undefined);
    document.body.classList.add('can-not-be-selected')
  }

  const handleRemove = ()=>{
    if(canvasStore.selectedNode){
      backupToUndoList(undefined);
      let parentId = canvasStore.selectedNode.parent?.id;
      canvasStore.selectedNode.remove();
      canvasStore.setSelectedNode(undefined);
      canvasStore.setRedoList([]);
      canvasStore.setRefreshNodeId(parentId)
    }
  }

  const handleDupliate = ()=>{
    if(canvasStore.selectedNode){
      backupToUndoList(undefined);      
      let newNode = canvasStore.selectedNode?.duplicate();
      canvasStore.setSelectedNode(newNode);
      canvasStore.setRedoList([]);
      canvasStore.setRefreshNodeId(canvasStore.selectedNode?.parent?.id);
    }
  }

  const handleSelectParent = ()=>{
    canvasStore.setSelectedNode(canvasStore.selectedNode?.parent);
  }

  let draggedLabel = canvasStore.draggedToolboxItem ?canvasStore.draggedToolboxItem?.title || intl.get(canvasStore.draggedToolboxItem?.titleKey||'') : canvasStore.draggedNode?.meta.name;
   return (
    <CanvarsStoreProvider value = {canvasStore}>
      <Backdrop className={classes.backdrop} open={true}>        
        <DesignerLayout
          leftArea = {
            <LeftContent 
              pageSchema={pageSchema} 
              selectedNode = {canvasStore.selectedNode}
              onPropChange = {handlePropChange}
              onSettingsChange={handlPageChange}
              onStartDragToolboxItem = {handleStartDragMetas}
            />
          }

          toolbar = {
            <Fragment>
              <IconButton 
                onClick = {()=>{
                  canvasStore.setShowOutline(!canvasStore.showOutline)
                }}
              >
                <MdiIcon iconClass="mdi-border-none-variant" color={canvasStore.showOutline ? theme.palette.primary.main : ''}/>
              </IconButton>
              <IconButton
                onClick = {()=>{
                  canvasStore.setShowPaddingX(!canvasStore.showPaddingX)
                }}
              >
                <MdiIcon iconClass="mdi-arrow-expand-horizontal" color={canvasStore.showPaddingX ? theme.palette.primary.main : ''}/>
              </IconButton>
              <IconButton
                onClick = {()=>{
                  canvasStore.setShowPaddingY(!canvasStore.showPaddingY)
                }}
                >
                <MdiIcon iconClass="mdi-arrow-expand-vertical" color={canvasStore.showPaddingY ? theme.palette.primary.main : ''}/>
              </IconButton>
              <IconButton 
                disabled = {canvasStore.undoList.length === 0}
                onClick = {handleUndo}
              >
                <MdiIcon iconClass="mdi-undo"/>
              </IconButton>
              <IconButton disabled = {canvasStore.redoList.length === 0}
                onClick = {handleRedo}
              >
                <MdiIcon iconClass="mdi-redo"/>
              </IconButton>
              <IconButton onClick = {handleClear}>
                <MdiIcon iconClass="mdi-delete-outline"/>
              </IconButton>
              <Spacer></Spacer>
              <Button onClick={handleCancel} className = {classes.cancelButton}>
                {intl.get('go-back')}
              </Button>
              <SubmitButton
                variant = "contained"
                color = "primary"         
                size="large"
                onClick={handleSave} 
                submitting={saving}
                disabled = {!dirty}
              >
                {intl.get('save')}
              </SubmitButton>
            </Fragment>
          }
        >
          {loading? <Container><PageSkeleton /></Container> :
            <Scrollbar permanent className={classes.scrollBar} onScroll ={handleScroll}>
              {canvasStore.canvas&&
                <ComponentView 
                  node ={canvasStore.canvas} 
                />
              }
              {
                canvasStore.selectedNode &&
                <Fragment>
                  <SelectedLabel label = {canvasStore.selectedNode?.meta.name} />
                  <NodeToolbar 
                    onBeginDrag = {handleBeginDrag}
                    onRemove = {handleRemove}
                    onSelectParent = {handleSelectParent}
                    onDuplicate = {handleDupliate}
                  />
                </Fragment>
              }

            </Scrollbar>
          }
        </DesignerLayout>
        <Fragment>
          {
            (canvasStore.draggedToolboxItem || canvasStore.draggedNode) &&
            <MouseFollower label={ draggedLabel || 'unknow'} />
          }
          {
            (canvasStore.draggedToolboxItem || canvasStore.draggedNode) &&
            <DragCusor/>
          }
          <ConfirmDialog 
            message = {intl.get('changing-not-save-message')}
            open = {backConfirmOpen}
            onCancel ={()=>{setBackConfirmOpen(false)}}
            onConfirm = {handleBackConfirm}
          />
        </Fragment>      
      </Backdrop>
    </CanvarsStoreProvider>
  );
})