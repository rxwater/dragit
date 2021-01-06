import { Rule } from "base/Rules/Rule";
import { IProp } from "base/Model/IProp";
import { IMeta } from "base/Model/IMeta";
import OptionSelect from "base/PropsInputs/OptionSelect";
import StringInput from "base/PropsInputs/StringInput";

export class TableColumnRule extends Rule{
 
  accept(child:IMeta){
    if(child.name === 'TableColumn'){
      return false;
    }
    return true;
  }

  getFields(): Array<IProp>{
    return [
      {
        name:'label',
        label:'label',
        input:StringInput,
      },
      {
        name:'width',
        label:'width',
        input:StringInput,
      },
      {
        name:'align',
        label:'align',
        input:OptionSelect,
        props:{
          items:[
            {
              value:'center',
              label:'Center'
            },
            {
              value:'inherit',
              label:'Inherit'
            },
            {
              value:'justify',
              label:'Justify'
            },
            {
              value:'left',
              label:'Left'
            },
            {
              value:'right',
              label:'Right'
            },
          ]
        },
      },
      {
        name:'size',
        label:'size',
        input:OptionSelect,
        props:{
          items:[
            {
              value:'medium',
              label:'Medium'
            },
            {
              value:'small',
              label:'Small'
            },
          ]
        },
      },
    ]
  }

}