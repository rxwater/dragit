import { API_QUERY_AND_OPERATE_MODELS } from "APIs/model";

export default {
  name:'ListView',
  designProps:{
    dataApi:null,
  },
  props:{
    withActions:true,
    elevation:6,
    columns:[
      {
        field:'contract_no',
        label:'合同号',
        sortable:true,
        //template:'<span style="color:red;">{$title}</span>',
        props:{
        }
      },
      {
        field:'customer',
        label:'客户',
        sortable:true,
      },
      {
        field:'amount',
        label:'合同金额',
        sortable:true,
      },
      {
        field:'percent',
        label:'收款比例',
      },
      {
        field:'commission',
        label:'已付提成',
      },
      {
        field:'created_at',
        label:'合同日期',
        sortable:true,
        props:{
        }
      },

    ],
    rowsPerPageOptions:'10,25,50',
    defalutRowsPerPage:'10',
    filters:[
      {
        slug:'status',
        label:'状态',
        searchable:true,
        conditions:[
          {
            slug:'slug1',
            label:'待收款'
          },
          {
            slug:'slug2',
            label:'已完成'
          },
        ]
      },
    ],
    batchCommands:[
      {
        slug:"publish",
        label:"发布",
        icon:"mdi-publish",
      },
      {
        slug:"check",
        label:"审核",
        icon:"mdi-check-bold",
      },
      {
        slug:"delete",
        label:"删除",
        icon:"mdi-delete",
      },
    ],
    rowCommands:[
      {
        slug:"edit",
        label:"编辑",
        icon:"mdi-pencil",
        jumpToPage:{
          moduleSlug:'order',
          pageSlug:'order-edit',
          param:'id',
          paramField:'id',
        }
      },
      {
        slug:"delete",
        label:"删除",
        icon:"mdi-delete",
      },
    ],
    dataApi:{
      ...API_QUERY_AND_OPERATE_MODELS,
      params:{
        modelName:'/Model/Order',
      },      
    },

  }
}