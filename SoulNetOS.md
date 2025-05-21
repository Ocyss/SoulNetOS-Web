---
title: SoulNetOS
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# SoulNetOS

Base URLs:

# Authentication

# Config/LLM

<a id="opIdget_llm_providers_v1_config_llm_providers_get"></a>

## GET Get Llm Providers

GET /v1/admin/config/llm/providers

> 返回示例

> 200 Response

```json
[
  {
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "id": 0,
    "enabled": true,
    "name": "",
    "api_base": "",
    "api_key": ""
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

*Response Get Llm Providers V1 Config Llm Providers Get*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|Response Get Llm Providers V1 Config Llm Providers Get|[[LLMProvider](#schemallmprovider)]|false|none|Response Get Llm Providers V1 Config Llm Providers Get|none|
|» LLMProvider|[LLMProvider](#schemallmprovider)|false|none|LLMProvider|none|
|»» created_at|string(date-time)|false|none|Created At|none|
|»» updated_at|string(date-time)|false|none|Updated At|none|
|»» id|integer|false|none|Id|none|
|»» enabled|boolean|false|none|Enabled|none|
|»» name|string|false|none|Name|none|
|»» api_base|string|false|none|Api Base|none|
|»» api_key|string|false|none|Api Key|none|

<a id="opIdcreate_llm_provider_v1_config_llm_providers_post"></a>

## POST Create Llm Provider

POST /v1/admin/config/llm/providers

> Body 请求参数

```json
{
  "enabled": true,
  "name": "",
  "api_base": "",
  "api_key": ""
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|[LLMProviderCreate](#schemallmprovidercreate)| 否 | LLMProviderCreate|none|

> 返回示例

> 200 Response

```json
{
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "id": 0,
  "enabled": true,
  "name": "",
  "api_base": "",
  "api_key": ""
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[LLMProvider](#schemallmprovider)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|none|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIdget_llm_provider_v1_config_llm_providers__provider_id__get"></a>

## GET Get Llm Provider

GET /v1/admin/config/llm/providers/{provider_id}

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|provider_id|path|integer| 是 | Provider Id|none|

> 返回示例

> 200 Response

```json
{
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "id": 0,
  "enabled": true,
  "name": "",
  "api_base": "",
  "api_key": ""
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[LLMProvider](#schemallmprovider)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|none|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIdupdate_llm_provider_v1_config_llm_providers__provider_id__patch"></a>

## PATCH Update Llm Provider

PATCH /v1/admin/config/llm/providers/{provider_id}

> Body 请求参数

```json
{
  "enabled": true,
  "name": "",
  "api_base": "",
  "api_key": ""
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|provider_id|path|integer| 是 | Provider Id|none|
|body|body|[LLMProviderUpdate](#schemallmproviderupdate)| 否 | LLMProviderUpdate|none|

> 返回示例

> 200 Response

```json
{
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "id": 0,
  "enabled": true,
  "name": "",
  "api_base": "",
  "api_key": ""
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[LLMProvider](#schemallmprovider)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|none|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIddelete_llm_provider_v1_config_llm_providers__provider_id__delete"></a>

## DELETE Delete Llm Provider

DELETE /v1/admin/config/llm/providers/{provider_id}

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|provider_id|path|integer| 是 | Provider Id|none|

> 返回示例

> 204 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|none|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|none|[HTTPValidationError](#schemahttpvalidationerror)|

### 返回数据结构

状态码 **422**

*HTTPValidationError*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» detail|[[ValidationError](#schemavalidationerror)]|false|none|Detail|none|
|»» ValidationError|[ValidationError](#schemavalidationerror)|false|none|ValidationError|none|
|»»» loc|[anyOf]|true|none|Location|none|

*anyOf*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|»»»» *anonymous*|string|false|none||none|

*or*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|»»»» *anonymous*|integer|false|none||none|

*continued*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|»»» msg|string|true|none|Message|none|
|»»» type|string|true|none|Error Type|none|

<a id="opIdget_llm_models_v1_config_llm_models_get"></a>

## GET Get Llm Models

GET /v1/admin/config/llm/models

> 返回示例

> 200 Response

```json
[
  {
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "id": 0,
    "enabled": true,
    "name": "",
    "model_id": "",
    "provider_id": 0,
    "is_default": false
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

*Response Get Llm Models V1 Config Llm Models Get*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|Response Get Llm Models V1 Config Llm Models Get|[[LLMModel](#schemallmmodel)]|false|none|Response Get Llm Models V1 Config Llm Models Get|none|
|» LLMModel|[LLMModel](#schemallmmodel)|false|none|LLMModel|none|
|»» created_at|string(date-time)|false|none|Created At|none|
|»» updated_at|string(date-time)|false|none|Updated At|none|
|»» id|integer|false|none|Id|none|
|»» enabled|boolean|false|none|Enabled|none|
|»» name|string|false|none|Name|none|
|»» model_id|string|false|none|Model Id|none|
|»» provider_id|integer|true|none|Provider Id|none|
|»» is_default|boolean|false|none|Is Default|none|

<a id="opIdcreate_llm_model_v1_config_llm_models_post"></a>

## POST Create Llm Model

POST /v1/admin/config/llm/models

> Body 请求参数

```json
{
  "enabled": true,
  "name": "",
  "model_id": "",
  "provider_id": 0,
  "is_default": false
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|[LLMModelCreate](#schemallmmodelcreate)| 否 | LLMModelCreate|none|

> 返回示例

> 200 Response

```json
{
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "id": 0,
  "enabled": true,
  "name": "",
  "model_id": "",
  "provider_id": 0,
  "is_default": false
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[LLMModel](#schemallmmodel)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|none|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIdget_llm_model_v1_config_llm_models__model_id__get"></a>

## GET Get Llm Model

GET /v1/admin/config/llm/models/{model_id}

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|model_id|path|integer| 是 | Model Id|none|

> 返回示例

> 200 Response

```json
{
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "id": 0,
  "enabled": true,
  "name": "",
  "model_id": "",
  "provider_id": 0,
  "is_default": false
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[LLMModel](#schemallmmodel)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|none|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIdupdate_llm_model_v1_config_llm_models__model_id__patch"></a>

## PATCH Update Llm Model

PATCH /v1/admin/config/llm/models/{model_id}

> Body 请求参数

```json
{
  "enabled": true,
  "name": "",
  "model_id": "",
  "provider_id": 0,
  "is_default": false
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|model_id|path|integer| 是 | Model Id|none|
|body|body|[LLMModelUpdate](#schemallmmodelupdate)| 否 | LLMModelUpdate|none|

> 返回示例

> 200 Response

```json
{
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "id": 0,
  "enabled": true,
  "name": "",
  "model_id": "",
  "provider_id": 0,
  "is_default": false
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[LLMModel](#schemallmmodel)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|none|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIddelete_llm_model_v1_config_llm_models__model_id__delete"></a>

## DELETE Delete Llm Model

DELETE /v1/admin/config/llm/models/{model_id}

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|model_id|path|integer| 是 | Model Id|none|

> 返回示例

> 204 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|none|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|none|[HTTPValidationError](#schemahttpvalidationerror)|

### 返回数据结构

状态码 **422**

*HTTPValidationError*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» detail|[[ValidationError](#schemavalidationerror)]|false|none|Detail|none|
|»» ValidationError|[ValidationError](#schemavalidationerror)|false|none|ValidationError|none|
|»»» loc|[anyOf]|true|none|Location|none|

*anyOf*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|»»»» *anonymous*|string|false|none||none|

*or*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|»»»» *anonymous*|integer|false|none||none|

*continued*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|»»» msg|string|true|none|Message|none|
|»»» type|string|true|none|Error Type|none|

# 数据模型

<h2 id="tocS_HTTPValidationError">HTTPValidationError</h2>

<a id="schemahttpvalidationerror"></a>
<a id="schema_HTTPValidationError"></a>
<a id="tocShttpvalidationerror"></a>
<a id="tocshttpvalidationerror"></a>

```json
{
  "detail": [
    {
      "loc": [
        "string"
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

```

HTTPValidationError

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|detail|[[ValidationError](#schemavalidationerror)]|false|none|Detail|none|

<h2 id="tocS_ValidationError">ValidationError</h2>

<a id="schemavalidationerror"></a>
<a id="schema_ValidationError"></a>
<a id="tocSvalidationerror"></a>
<a id="tocsvalidationerror"></a>

```json
{
  "loc": [
    "string"
  ],
  "msg": "string",
  "type": "string"
}

```

ValidationError

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|loc|[anyOf]|true|none|Location|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|integer|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|msg|string|true|none|Message|none|
|type|string|true|none|Error Type|none|

<h2 id="tocS_LLMProvider">LLMProvider</h2>

<a id="schemallmprovider"></a>
<a id="schema_LLMProvider"></a>
<a id="tocSllmprovider"></a>
<a id="tocsllmprovider"></a>

```json
{
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "id": 0,
  "enabled": true,
  "name": "",
  "api_base": "",
  "api_key": ""
}

```

LLMProvider

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|created_at|string(date-time)|false|none|Created At|none|
|updated_at|string(date-time)|false|none|Updated At|none|
|id|integer|false|none|Id|none|
|enabled|boolean|false|none|Enabled|none|
|name|string|false|none|Name|none|
|api_base|string|false|none|Api Base|none|
|api_key|string|false|none|Api Key|none|

<h2 id="tocS_LLMModel">LLMModel</h2>

<a id="schemallmmodel"></a>
<a id="schema_LLMModel"></a>
<a id="tocSllmmodel"></a>
<a id="tocsllmmodel"></a>

```json
{
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "id": 0,
  "enabled": true,
  "name": "",
  "model_id": "",
  "provider_id": 0,
  "is_default": false
}

```

LLMModel

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|created_at|string(date-time)|false|none|Created At|none|
|updated_at|string(date-time)|false|none|Updated At|none|
|id|integer|false|none|Id|none|
|enabled|boolean|false|none|Enabled|none|
|name|string|false|none|Name|none|
|model_id|string|false|none|Model Id|none|
|provider_id|integer|true|none|Provider Id|none|
|is_default|boolean|false|none|Is Default|none|

<h2 id="tocS_LLMModelCreate">LLMModelCreate</h2>

<a id="schemallmmodelcreate"></a>
<a id="schema_LLMModelCreate"></a>
<a id="tocSllmmodelcreate"></a>
<a id="tocsllmmodelcreate"></a>

```json
{
  "enabled": true,
  "name": "",
  "model_id": "",
  "provider_id": 0,
  "is_default": false
}

```

LLMModelCreate

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|enabled|boolean|false|none|Enabled|none|
|name|string|false|none|Name|none|
|model_id|string|false|none|Model Id|none|
|provider_id|integer|true|none|Provider Id|none|
|is_default|boolean|false|none|Is Default|none|

<h2 id="tocS_LLMModelUpdate">LLMModelUpdate</h2>

<a id="schemallmmodelupdate"></a>
<a id="schema_LLMModelUpdate"></a>
<a id="tocSllmmodelupdate"></a>
<a id="tocsllmmodelupdate"></a>

```json
{
  "enabled": true,
  "name": "",
  "model_id": "",
  "provider_id": 0,
  "is_default": false
}

```

LLMModelUpdate

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|enabled|boolean|false|none|Enabled|none|
|name|string|false|none|Name|none|
|model_id|string|false|none|Model Id|none|
|provider_id|integer|true|none|Provider Id|none|
|is_default|boolean|false|none|Is Default|none|

<h2 id="tocS_LLMProviderCreate">LLMProviderCreate</h2>

<a id="schemallmprovidercreate"></a>
<a id="schema_LLMProviderCreate"></a>
<a id="tocSllmprovidercreate"></a>
<a id="tocsllmprovidercreate"></a>

```json
{
  "enabled": true,
  "name": "",
  "api_base": "",
  "api_key": ""
}

```

LLMProviderCreate

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|enabled|boolean|false|none|Enabled|none|
|name|string|false|none|Name|none|
|api_base|string|false|none|Api Base|none|
|api_key|string|false|none|Api Key|none|

<h2 id="tocS_LLMProviderUpdate">LLMProviderUpdate</h2>

<a id="schemallmproviderupdate"></a>
<a id="schema_LLMProviderUpdate"></a>
<a id="tocSllmproviderupdate"></a>
<a id="tocsllmproviderupdate"></a>

```json
{
  "enabled": true,
  "name": "",
  "api_base": "",
  "api_key": ""
}

```

LLMProviderUpdate

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|enabled|boolean|false|none|Enabled|none|
|name|string|false|none|Name|none|
|api_base|string|false|none|Api Base|none|
|api_key|string|false|none|Api Key|none|

