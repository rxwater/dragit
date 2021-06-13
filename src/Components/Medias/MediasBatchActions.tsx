import React from 'react';
import { makeStyles, Theme, createStyles, lighten, Typography, IconButton, Tooltip } from '@material-ui/core';
import classNames from 'classnames';
import intl from "react-intl-universal";
import MdiIcon from 'Components/common/MdiIcon';
import Spacer from 'Components/common/Spacer';
import { useMediasStore } from './MediasStore';
import {observer} from 'mobx-react';
import { MUTATION_REMOVE_MEDIAS } from './MediasGQLs';
import { useShowServerError } from 'Store/Helpers/useInfoError';
import { IRxMedia } from 'Base/Model/IRxMedia';
import useLayzyAxios from 'Data/useLayzyAxios';
import { API_MAGIC_DELETE } from 'APIs/magic';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flex:'1',
      display: 'flex',
      height:'100%',
      alignItems:'center',
      paddingLeft:theme.spacing(1),
    },
    shell:
      theme.palette.type === 'light'
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
          },
    title: {
      flex: '1 1 100%',
    },
  }),
);

export const MediasBatchActions = observer(()=>{
  //const {selectedMedias, onClearSelected, onRemoveSelected} = props;
  const mediasStore = useMediasStore();
  const classes = useStyles();
  const toolIconSize = 21;
  const [removeMedias, {error}] = useLayzyAxios(API_MAGIC_DELETE,{
    onCompleted:(data:any)=>{
      mediasStore.selectedMediaStores.forEach(media=>media.setLoading(false));
      mediasStore?.removeMedias(data?.RxMediaFolder);
    }});

  useShowServerError(error);

  const handleClearSelected = ()=>{
    mediasStore?.clearSelected();
  }

  const handelRemoveSelected = ()=>{
    mediasStore.selectedMediaStores.forEach(media=>media.setLoading(true));
    removeMedias({data:{id:mediasStore.selectedMedias.map(media=>media.id)}});
  }

  return (
    <div className={classNames(classes.root, classes.shell)}>
      <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
         {intl.get('records-selected')} {mediasStore?.selectedMedias.length}
      </Typography>
      <Spacer />
      <Tooltip title={intl.get('clear-selected')} arrow placement="top">
        <IconButton aria-label={intl.get('clear-selected')} component="span"
          onClick = {handleClearSelected}
        >
          <MdiIcon iconClass="mdi-broom" size={toolIconSize} />
        </IconButton>
      </Tooltip>
      <Tooltip title={intl.get('delete')} arrow placement="top">
        <IconButton aria-label={intl.get('delete')} component="span"
          onClick = {handelRemoveSelected}
        >
          <MdiIcon iconClass="mdi-delete-sweep-outline" size={toolIconSize} />
        </IconButton>
      </Tooltip>
      {
        mediasStore?.selectedMedias.length === 1 &&
        <Tooltip title={intl.get('replace')} arrow placement="top">
          <IconButton aria-label={intl.get('replace')} component="span">
            <MdiIcon iconClass="mdi-file-replace-outline" size={toolIconSize} />
          </IconButton>
        </Tooltip>
      }
    </div>
  )
})
