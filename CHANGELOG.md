# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.4](https://github.com/mirazopablo/Viking-App-Web/compare/v0.1.3...v0.1.4) (2026-09-05)


### Features

* **core:** implement pagination models and core component ([8131814](https://github.com/mirazopablo/Viking-App-Web/commit/8131814ea4b4d6405b75b938c35b3a4b6809f1e3))

### [0.1.3](https://github.com/mirazopablo/Viking-App-Web/compare/v0.1.2...v0.1.3) (2026-09-04)


### Features

* **admin:** add availability manager dashboard ([461239e](https://github.com/mirazopablo/Viking-App-Web/commit/461239e9e2614d90d38fdcee64cbd648608ea5f8))
* **booking:** implement non-working hour skips for 24h advance logic ([9d68875](https://github.com/mirazopablo/Viking-App-Web/commit/9d688758afd58d19d45eb421da410bd22a1b54ea))


### Bug Fixes

* **ui:** enforce 24-hour advance notice for appointments ([c090ad8](https://github.com/mirazopablo/Viking-App-Web/commit/c090ad8fcd42fa969ffc6c14ea9c5c628b22a3c2))

### 0.1.2 (2026-08-26)


### Features

* **admin:** enhance admin dashboard layout and core diagnostic services ([4f3d2cf](https://github.com/mirazopablo/Viking-App-Web/commit/4f3d2cfb79aba6af6641175f5925e1d4720d9f82))
* **auth:** implement authentication pages and public work order lookup portal ([1a1e61c](https://github.com/mirazopablo/Viking-App-Web/commit/1a1e61c42523b62e2be9a3defeb7d1f0c5a8c8b1))
* **auth:** implement proactive 4-hour JWT expiration detection and login alert ([1608f19](https://github.com/mirazopablo/Viking-App-Web/commit/1608f19b4905cba0f5f17bee937dc38cf4ad0170))
* **auth:** improve authentication workflow and role verification hook ([ad5c280](https://github.com/mirazopablo/Viking-App-Web/commit/ad5c280726d75e59dcae40798e1de083717ecc45))
* **booking:** add desktop booking modal and dynamic availability by device type ([f6a7c83](https://github.com/mirazopablo/Viking-App-Web/commit/f6a7c833703a2f4db762335d3aea5a6f3129270f))
* **budget-engine:** enable hidden unit prices globally across all budget modes ([7de4f4f](https://github.com/mirazopablo/Viking-App-Web/commit/7de4f4ff645a5c9d3c5c32fa7bd7ae4c53c69996))
* **budget:** implement dynamic budget creator and modular A4 PDF export engine ([3f817bf](https://github.com/mirazopablo/Viking-App-Web/commit/3f817bf7f3fb4309dcab6d733de1ce55d27528a3))
* **budget:** implement public budget endpoint routing and hard delete client method ([b388242](https://github.com/mirazopablo/Viking-App-Web/commit/b3882429c2570c27a3a27ee6da71a19993e60b42))
* **budget:** integrate Go REST API endpoints for budget persistence and loading ([1e9dad0](https://github.com/mirazopablo/Viking-App-Web/commit/1e9dad089596521de319c39d12d08f75782471da))
* **client-devices:** update client and device views with quick creation flow ([d133c10](https://github.com/mirazopablo/Viking-App-Web/commit/d133c10fb8cadeb54859bab62e80fbe4d2d82e6d))
* **clients:** refine client directory views and quick creation modals ([ff3d109](https://github.com/mirazopablo/Viking-App-Web/commit/ff3d1099bf222d17b3a428599974c9ef9cdc8d21))
* **core:** establish global layout, application providers and shared types ([21e4d13](https://github.com/mirazopablo/Viking-App-Web/commit/21e4d1393cccd4e05314c9d81953f0b33700be6b))
* **directory:** implement clients and devices directories with PII lock and lightbox ([86b901c](https://github.com/mirazopablo/Viking-App-Web/commit/86b901cff44e583476d737ae52706ab009c976df))
* **evidence:** implement multipart photo upload and live status transitions ([aa348cc](https://github.com/mirazopablo/Viking-App-Web/commit/aa348cc96c11fbad0d13f9454be0b535a3105654))
* **inventory:** implement debounced search pickers and quick creation modals ([24f5dd4](https://github.com/mirazopablo/Viking-App-Web/commit/24f5dd45f14e452e073939d22e00c175f89aac2c))
* **notifications:** integrate web push notification feed and service worker handlers ([2cecbc0](https://github.com/mirazopablo/Viking-App-Web/commit/2cecbc01b0adbf396a771fea78387495bc2df6c3))
* **public:** add fixed prefix badge to security code input ([0955655](https://github.com/mirazopablo/Viking-App-Web/commit/0955655dab20a96ff25fffe13bdf8beca2e8823e))
* **quotes:** implement general quick quote module and mobile nav redesign ([8853c1c](https://github.com/mirazopablo/Viking-App-Web/commit/8853c1cea75c6d4d698a47009a362fd69033763e))
* **status:** add 100% mobile responsive customer budget viewer modal on status page ([6355d58](https://github.com/mirazopablo/Viking-App-Web/commit/6355d582b81f35854245db2a45a8f14fb987c63a))
* **triage:** implement work order creation form and mandatory WOVIK code alert ([a198b8c](https://github.com/mirazopablo/Viking-App-Web/commit/a198b8c6e670aaaa80ebbafbd459e35062ab6c64))
* **ui:** add public internationalization dictionaries and language switcher ([a918811](https://github.com/mirazopablo/Viking-App-Web/commit/a91881107eaa3ceeed4133b866c7575903eb5b7f))
* **ui:** implement primitive ui component library and shared navigation elements ([db58b95](https://github.com/mirazopablo/Viking-App-Web/commit/db58b95e83e3ae56c447c91bf5966009471e69ce))
* **ui:** implement separate mobile bottom navigation for admin panel ([7eeddca](https://github.com/mirazopablo/Viking-App-Web/commit/7eeddca4093bf80b8ffbe927e54013dc601b6a13))
* **ui:** internationalize public pages and link author portfolio ([b5e5b56](https://github.com/mirazopablo/Viking-App-Web/commit/b5e5b5631fa27358a4c174bace32af8cf047a190))
* **ui:** unify navbar and mobile bottom nav across all routes ([8fa7bec](https://github.com/mirazopablo/Viking-App-Web/commit/8fa7beca4f21096bdfcfaeaf67e677502808b720))
* **work-orders:** add budget hard delete and bidirectional timeline synchronization ([766e283](https://github.com/mirazopablo/Viking-App-Web/commit/766e283a2a3d791b85baaf80a6750d3dbb2a2920))
* **work-orders:** enhance work order detail pages and status transition workflows ([c626711](https://github.com/mirazopablo/Viking-App-Web/commit/c626711c5c06645465c80821fa88424caa41b251))
* **work-orders:** enhance work order management workflow and live status updater ([1f05daa](https://github.com/mirazopablo/Viking-App-Web/commit/1f05daa6e9ebd5214cc46336914f829a8790a19d))


### Bug Fixes

* **api:** exempt public requests from global 401 staff login redirect interceptor ([f6f4801](https://github.com/mirazopablo/Viking-App-Web/commit/f6f4801162810541846e9b1ef12578200e3fd811))
* **budget:** add diegnosticService missing import ([530c96e](https://github.com/mirazopablo/Viking-App-Web/commit/530c96e462ac802ffd3a6f405fbab2f2bc17888f))
* **devices:** import missing DeviceResponseDTO type in devices page ([b398eb2](https://github.com/mirazopablo/Viking-App-Web/commit/b398eb2b4d5e3539d78bb7d5ade3fb5b8460852e))
* **networking:** use relative same-origin path for api client defaults ([9e9571c](https://github.com/mirazopablo/Viking-App-Web/commit/9e9571c8bb35dd8bbed028e2c7906338956574f2))
* **quotes:** fix typescript compilation error for undefined properties ([9f1be09](https://github.com/mirazopablo/Viking-App-Web/commit/9f1be09e68ee57099de3c8865b48fabbc0e78fde))
* **timeline:** add defensive null checks and budget entry discrimination in timeline ([82f2823](https://github.com/mirazopablo/Viking-App-Web/commit/82f2823a3bae8ed8aeedd8c46c386b00130e34b1))
* **timeline:** add entryType DTO support and differentiate public vs admin budget actions ([01ee41d](https://github.com/mirazopablo/Viking-App-Web/commit/01ee41dc16571ea05f7318822c06529ad2069613))
* **ui:** add dual camelCase and snake_case mapping for public mobile view ([b6cd81c](https://github.com/mirazopablo/Viking-App-Web/commit/b6cd81c83ac737a25eaccd7b059f827f5624f4a8))
* **ui:** auto-resolve staff name on printable pdfs ([9b4e1e3](https://github.com/mirazopablo/Viking-App-Web/commit/9b4e1e3780cfcafe5f0a62aeb0193d2419a967b7))
* **ui:** correct bonification discount calculations on printable pdfs ([642ece0](https://github.com/mirazopablo/Viking-App-Web/commit/642ece00cbcb0263f4569a2157c3ea2891f62277))
* **ui:** correct LoadingButton props inheritance with ComponentProps ([26bb028](https://github.com/mirazopablo/Viking-App-Web/commit/26bb02808e06121b13d3a65149872eb92d40fbe6))
* **ui:** expand dialog max width and deserialize budget JSON strings ([cda6f05](https://github.com/mirazopablo/Viking-App-Web/commit/cda6f05afcc62a485bd1c2579a77d4ecad319b93))

### 0.1.1 (2026-08-26)


### Features

* **admin:** enhance admin dashboard layout and core diagnostic services ([4f3d2cf](https://github.com/mirazopablo/Viking-App-Web/commit/4f3d2cfb79aba6af6641175f5925e1d4720d9f82))
* **auth:** implement authentication pages and public work order lookup portal ([1a1e61c](https://github.com/mirazopablo/Viking-App-Web/commit/1a1e61c42523b62e2be9a3defeb7d1f0c5a8c8b1))
* **auth:** implement proactive 4-hour JWT expiration detection and login alert ([1608f19](https://github.com/mirazopablo/Viking-App-Web/commit/1608f19b4905cba0f5f17bee937dc38cf4ad0170))
* **auth:** improve authentication workflow and role verification hook ([ad5c280](https://github.com/mirazopablo/Viking-App-Web/commit/ad5c280726d75e59dcae40798e1de083717ecc45))
* **booking:** add desktop booking modal and dynamic availability by device type ([f6a7c83](https://github.com/mirazopablo/Viking-App-Web/commit/f6a7c833703a2f4db762335d3aea5a6f3129270f))
* **budget-engine:** enable hidden unit prices globally across all budget modes ([7de4f4f](https://github.com/mirazopablo/Viking-App-Web/commit/7de4f4ff645a5c9d3c5c32fa7bd7ae4c53c69996))
* **budget:** implement dynamic budget creator and modular A4 PDF export engine ([3f817bf](https://github.com/mirazopablo/Viking-App-Web/commit/3f817bf7f3fb4309dcab6d733de1ce55d27528a3))
* **budget:** implement public budget endpoint routing and hard delete client method ([b388242](https://github.com/mirazopablo/Viking-App-Web/commit/b3882429c2570c27a3a27ee6da71a19993e60b42))
* **budget:** integrate Go REST API endpoints for budget persistence and loading ([1e9dad0](https://github.com/mirazopablo/Viking-App-Web/commit/1e9dad089596521de319c39d12d08f75782471da))
* **client-devices:** update client and device views with quick creation flow ([d133c10](https://github.com/mirazopablo/Viking-App-Web/commit/d133c10fb8cadeb54859bab62e80fbe4d2d82e6d))
* **clients:** refine client directory views and quick creation modals ([ff3d109](https://github.com/mirazopablo/Viking-App-Web/commit/ff3d1099bf222d17b3a428599974c9ef9cdc8d21))
* **core:** establish global layout, application providers and shared types ([21e4d13](https://github.com/mirazopablo/Viking-App-Web/commit/21e4d1393cccd4e05314c9d81953f0b33700be6b))
* **directory:** implement clients and devices directories with PII lock and lightbox ([86b901c](https://github.com/mirazopablo/Viking-App-Web/commit/86b901cff44e583476d737ae52706ab009c976df))
* **evidence:** implement multipart photo upload and live status transitions ([aa348cc](https://github.com/mirazopablo/Viking-App-Web/commit/aa348cc96c11fbad0d13f9454be0b535a3105654))
* **inventory:** implement debounced search pickers and quick creation modals ([24f5dd4](https://github.com/mirazopablo/Viking-App-Web/commit/24f5dd45f14e452e073939d22e00c175f89aac2c))
* **notifications:** integrate web push notification feed and service worker handlers ([2cecbc0](https://github.com/mirazopablo/Viking-App-Web/commit/2cecbc01b0adbf396a771fea78387495bc2df6c3))
* **public:** add fixed prefix badge to security code input ([0955655](https://github.com/mirazopablo/Viking-App-Web/commit/0955655dab20a96ff25fffe13bdf8beca2e8823e))
* **quotes:** implement general quick quote module and mobile nav redesign ([8853c1c](https://github.com/mirazopablo/Viking-App-Web/commit/8853c1cea75c6d4d698a47009a362fd69033763e))
* **status:** add 100% mobile responsive customer budget viewer modal on status page ([6355d58](https://github.com/mirazopablo/Viking-App-Web/commit/6355d582b81f35854245db2a45a8f14fb987c63a))
* **triage:** implement work order creation form and mandatory WOVIK code alert ([a198b8c](https://github.com/mirazopablo/Viking-App-Web/commit/a198b8c6e670aaaa80ebbafbd459e35062ab6c64))
* **ui:** add public internationalization dictionaries and language switcher ([a918811](https://github.com/mirazopablo/Viking-App-Web/commit/a91881107eaa3ceeed4133b866c7575903eb5b7f))
* **ui:** implement primitive ui component library and shared navigation elements ([db58b95](https://github.com/mirazopablo/Viking-App-Web/commit/db58b95e83e3ae56c447c91bf5966009471e69ce))
* **ui:** implement separate mobile bottom navigation for admin panel ([7eeddca](https://github.com/mirazopablo/Viking-App-Web/commit/7eeddca4093bf80b8ffbe927e54013dc601b6a13))
* **ui:** internationalize public pages and link author portfolio ([b5e5b56](https://github.com/mirazopablo/Viking-App-Web/commit/b5e5b5631fa27358a4c174bace32af8cf047a190))
* **ui:** unify navbar and mobile bottom nav across all routes ([8fa7bec](https://github.com/mirazopablo/Viking-App-Web/commit/8fa7beca4f21096bdfcfaeaf67e677502808b720))
* **work-orders:** add budget hard delete and bidirectional timeline synchronization ([766e283](https://github.com/mirazopablo/Viking-App-Web/commit/766e283a2a3d791b85baaf80a6750d3dbb2a2920))
* **work-orders:** enhance work order detail pages and status transition workflows ([c626711](https://github.com/mirazopablo/Viking-App-Web/commit/c626711c5c06645465c80821fa88424caa41b251))
* **work-orders:** enhance work order management workflow and live status updater ([1f05daa](https://github.com/mirazopablo/Viking-App-Web/commit/1f05daa6e9ebd5214cc46336914f829a8790a19d))


### Bug Fixes

* **api:** exempt public requests from global 401 staff login redirect interceptor ([f6f4801](https://github.com/mirazopablo/Viking-App-Web/commit/f6f4801162810541846e9b1ef12578200e3fd811))
* **budget:** add diegnosticService missing import ([530c96e](https://github.com/mirazopablo/Viking-App-Web/commit/530c96e462ac802ffd3a6f405fbab2f2bc17888f))
* **devices:** import missing DeviceResponseDTO type in devices page ([b398eb2](https://github.com/mirazopablo/Viking-App-Web/commit/b398eb2b4d5e3539d78bb7d5ade3fb5b8460852e))
* **networking:** use relative same-origin path for api client defaults ([9e9571c](https://github.com/mirazopablo/Viking-App-Web/commit/9e9571c8bb35dd8bbed028e2c7906338956574f2))
* **quotes:** fix typescript compilation error for undefined properties ([9f1be09](https://github.com/mirazopablo/Viking-App-Web/commit/9f1be09e68ee57099de3c8865b48fabbc0e78fde))
* **timeline:** add defensive null checks and budget entry discrimination in timeline ([82f2823](https://github.com/mirazopablo/Viking-App-Web/commit/82f2823a3bae8ed8aeedd8c46c386b00130e34b1))
* **timeline:** add entryType DTO support and differentiate public vs admin budget actions ([01ee41d](https://github.com/mirazopablo/Viking-App-Web/commit/01ee41dc16571ea05f7318822c06529ad2069613))
* **ui:** add dual camelCase and snake_case mapping for public mobile view ([b6cd81c](https://github.com/mirazopablo/Viking-App-Web/commit/b6cd81c83ac737a25eaccd7b059f827f5624f4a8))
* **ui:** auto-resolve staff name on printable pdfs ([9b4e1e3](https://github.com/mirazopablo/Viking-App-Web/commit/9b4e1e3780cfcafe5f0a62aeb0193d2419a967b7))
* **ui:** correct bonification discount calculations on printable pdfs ([642ece0](https://github.com/mirazopablo/Viking-App-Web/commit/642ece00cbcb0263f4569a2157c3ea2891f62277))
* **ui:** correct LoadingButton props inheritance with ComponentProps ([26bb028](https://github.com/mirazopablo/Viking-App-Web/commit/26bb02808e06121b13d3a65149872eb92d40fbe6))
* **ui:** expand dialog max width and deserialize budget JSON strings ([cda6f05](https://github.com/mirazopablo/Viking-App-Web/commit/cda6f05afcc62a485bd1c2579a77d4ecad319b93))
