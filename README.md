# Corp Prefetch
A tool to prefetch corp Api data from the server.

# Quick Start

```bash
pnpm install @norejs/prefetch
```

```javascript
// 发起预请求
import { createPreRequest } from '@norejs/prefetch';

// res 同@cotrip/corp-cross-request 的res
// req 同@cotrip/corp-cross-request 的req
// config config.expireTime 为缓存时间
createPreRequest(res,req,config).post("/restapi/restapi", requestParams)

```

# Document


# Development
```bash
pnpm install
```
# Run
```bash
pnpm start
```

# Build
```bash
pnpm build
```

# TODO
- [ ] Add SwiftCom Test

prefetch-manifest
```json
{
  links: [],
  scripts: [],
}
```

```html
<link href="style.css">
<script src="main.js"></script>
<link rel="prefetch-manifest" href="xxx.json">
<script type="prefetch" src="prefetch.js"></script>
```
