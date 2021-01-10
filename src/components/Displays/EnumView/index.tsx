import Chip from '@material-ui/core/Chip';
import withSkeleton from 'base/HOCs/withSkeleton';
import { RXInputProps } from 'base/RXInputProps';
import withFormField from 'components/common/withFormField';
import { useDesign } from 'design/PageEditor/useDesign';
import React from 'react';
import { first } from 'utils/ArrayHelper';

export interface ChipMeta{
  name:string,
  label:string,
  value: 'default' | 'primary' | 'secondary' | undefined
}

const EnumView = React.forwardRef((
  props:RXInputProps&{
    metas:[ChipMeta], 
  },
  ref:any
) =>{
  const {name, value, metas, error, helperText, ...rest} = props;
  const {isDesigning} = useDesign();
  const selectedMeta:ChipMeta|undefined = first(metas?.filter(meta=>meta.name === value))
  const render = value ?
    <Chip label={selectedMeta ? selectedMeta.label : value} color = {selectedMeta && selectedMeta.value} size = "small" />
    :
    <span></span>
  return(
    isDesigning?
      <div 
        ref={ref}
        {...rest}
      >
        {`field:${name}`}
      </div>
      :
      render
  )
})

export default withFormField(withSkeleton(EnumView));