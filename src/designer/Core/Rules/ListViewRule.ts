import { Rule } from "./Rule";
import { IMeta } from "../Node/IMeta";
import { INode } from "../Node/INode";
import { IField } from "./IRule";
import ListViewColumnsDialog from "designer/Attrebutebox/Inputs/ListViewColumnsDialog";
import ListViewFiltersDialog from "designer/Attrebutebox/Inputs/ListViewFiltersDialog";
import TextInput from "designer/Attrebutebox/Inputs/TextInput";

export class ListViewRule extends Rule{
  empertyPadding = '';
  
  match(meta:IMeta){
     return meta.name === 'ListView';
  }

  accept(child:INode){
    return false;
  }

  getFields(): Array<IField>{
    return [
      {
        name:'columns',
        label:'columns',
        input:ListViewColumnsDialog,
      },
      {
        name:'filters',
        label:'filters',
        input:ListViewFiltersDialog,
      },
      {
        name:'rowActions',
        label:'row-actions',
        input:ListViewFiltersDialog,
      },
      {
        name:'batchActions',
        label:'batch-actions',
        input:ListViewFiltersDialog,
      },
      {
        name:'rowsPerPageOptions',
        label:'rows-per-page-options',
        input:TextInput,
      },
      {
        name:'rowsPerPage',
        label:'rows-per-page',
        input:TextInput,
      },
    ]
  }

}