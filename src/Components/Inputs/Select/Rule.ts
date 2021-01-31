import { IMeta } from "Base/RXNode/IMeta";
import { IPropConfig } from "rx-drag/models/IPropConfig";
import OptionSelect from "AppStudio/RxPageEditor/AttrebuteBox/PropsInputs/OptionSelect";
import StringInput from "AppStudio/RxPageEditor/AttrebuteBox/PropsInputs/StringInput";
import inputRules from "Components/utils/configs/inputRules";
import itemsRule from "Components/utils/configs/itemsRule";
import { MetaConfig } from "Base/RXNode/MetaConfig";

export class SelectRule extends MetaConfig{
  editPaddingY = '';
  editPaddingX = '';
  empertyPadding = '';
  hasField = true;
  hasValidation = true;

  accept(child:IMeta){
    return false;
  }

  getPropConfigs(): Array<IPropConfig>{
    return [
      ...inputRules,
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
      /*{
        name:'multiple',
        label:'multiple-select',
        xs:6,
        input:BooleanInput,
      },*/
      {
        name:'itemKey',
        label:'item-key',
        input:StringInput,
      },
      {
        name:'itemName',
        label:'item-name',
        input:StringInput,
      },

      {
        name:'helperText',
        label:'helper-text',

        input:StringInput,
      },
      itemsRule,
    ]
  }


}