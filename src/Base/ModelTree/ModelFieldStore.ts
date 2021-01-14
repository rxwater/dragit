import { makeAutoObservable, toJS } from "mobx";
import { IFieldStore } from "./FieldStore";
import { IModelNode } from "./IModelNode";
import { creatId } from "Base/creatId";
import { ID } from "Base/Model/graphqlTypes";
import { IMetaProps } from "Base/Model/IMeta";


export class ModelFieldStore implements IFieldStore{
  id:ID;
  defaultValue?: any;
  value?: any;
  error?: string;
  metaProps?: IMetaProps;
  loading?: boolean;
  subFields: Map<string,IFieldStore>;
  constructor(metaProps?: IMetaProps) {
    this.id = creatId();
    this.metaProps = metaProps;
    this.subFields = new Map<string,IFieldStore>();
    makeAutoObservable(this);
  }

  setFieldStore(fieldName: string, fieldStore: IFieldStore) {
    this.subFields.set(fieldName, fieldStore);
  }

  getFieldStore(fieldName:string){
    return this.subFields.get(fieldName)
  }

  removeFieldStore(fieldName:string){
    this.subFields.delete(fieldName);
  }

  clearDirty(){
    this.subFields?.forEach((fieldStore, key)=>{
      fieldStore.clearDirty();
    })
  }

  isDirty(){
    let dirty = false;
    this.subFields?.forEach((fieldStore, key)=>{
      if(fieldStore.isDirty()){
        dirty = true;
      }
    })

    return dirty;
  }

  setLoading(loading?:boolean){
    this.loading = loading;
  }

  setValue(value: any) {
    this.subFields.forEach(fieldStore=>{
      fieldStore.setModel(value);
    })
  }

  setModel(model: any) {
    const fieldName = this.metaProps?.field;
    const fieldValue = model && fieldName ? model[fieldName] : undefined;
    this.defaultValue = fieldValue;
    this.subFields.forEach(fieldStore=>{
      fieldStore.setModel(fieldValue);
    })
  }

  toFieldsGQL() {
    let subGql = '';
    this.subFields.forEach(fieldStore=>{
      subGql = subGql + ` ${fieldStore.toFieldsGQL()} `
    })
    return subGql ? ` ${this.metaProps?.field}{id ${subGql}}` :  ` ${this.metaProps?.field} `;
  }

  getModelNode(name:string):IModelNode|undefined{
    return undefined
  }

  toInputValue(){
    let rtValue = this.defaultValue?.id ? {id:this.defaultValue?.id} as any : {} as any;
    this.subFields?.forEach((fieldStore, key)=>{
      if(!fieldStore.metaProps?.onlyShow){
        rtValue[key] = fieldStore.toInputValue();
      }
    })
    return rtValue;
  }

  updateDefaultValue(){
    this.defaultValue = toJS(this.value);
    this.subFields?.forEach((fieldStore, key)=>{
      fieldStore.updateDefaultValue();
    })
  }

  validate(){
    let passed = true;
    this.subFields?.forEach((fieldStore, key)=>{
      if(!fieldStore.validate()){
        passed = false;
      }
    })
    return passed;
  }

  reset(){
    this.subFields?.forEach((fieldStore, key)=>{
      fieldStore.reset()
    })
  }

  getChildren(){
    let children:Array<IModelNode> = [];
    this.subFields.forEach(fieldStore=>{
      children.push(fieldStore);
    })

    return children;
  }

  getLabel(){
    return `Submodel : ${this.metaProps?.field}`
  }
}
