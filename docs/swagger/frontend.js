/**
 * @swagger
 * tags:
 *   name: Master Data
 *   description: Master data management APIs
 *
 * components:
 *   schemas:
 *     MegaMenu:
 *       type: object
 *       required:
 *         - name_en
 *         - name_ar
 *         - status
 *       properties:
 *         name_en:
 *           type: string
 *           maxLength: 255
 *         name_ar:
 *           type: string
 *           maxLength: 255
 *         status:
 *           type: number
 *           enum: [0, 1]
 *
 *     MegaMenuCategory:
 *       type: object
 *       required:
 *         - parent_id
 *         - megamenu_id
 *         - category_name_en
 *         - category_name_ar
 *         - status
 *       properties:
 *         parent_id:
 *           type: string
 *         megamenu_id:
 *           type: string
 *         category_name_en:
 *           type: string
 *         category_name_ar:
 *           type: string
 *         description:
 *           type: string
 *         url:
 *           type: string
 *         image:
 *           type: string
 *           format: binary
 *         status:
 *           type: number
 *           enum: [0, 1]
 *
 * /api/masterdata/v1/createmega_menus:
 *   post:
 *     tags: [Master Data]
 *     summary: Create a new mega menu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MegaMenu'
 *     responses:
 *       201:
 *         description: Mega menu created successfully
 *
 * /api/masterdata/v1/getAllmega_menu:
 *   get:
 *     tags: [Master Data]
 *     summary: Get all mega menus
 *     responses:
 *       200:
 *         description: List of mega menus retrieved successfully
 *
 * /api/masterdata/v1/getmega_menusById/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *   get:
 *     tags: [Master Data]
 *     summary: Get mega menu by ID
 *     responses:
 *       200:
 *         description: Mega menu retrieved successfully
 *       404:
 *         description: Mega menu not found
 *
 * /api/masterdata/v1/updatemega_menus/{id}:
 *   put:
 *     tags: [Master Data]
 *     summary: Update mega menu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MegaMenu'
 *     responses:
 *       200:
 *         description: Mega menu updated successfully
 *       404:
 *         description: Mega menu not found
 *
 * /api/masterdata/v1/deletemega_menus/{id}:
 *   delete:
 *     tags: [Master Data]
 *     summary: Delete mega menu
 *     responses:
 *       200:
 *         description: Mega menu deleted successfully
 *       404:
 *         description: Mega menu not found
 *
 * /api/masterdata/v1/getAllmega_menu_categories:
 *   get:
 *     tags: [Master Data]
 *     summary: Get all mega menu categories
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
 *
 * /api/masterdata/v1/creatmega_menu_categories:
 *   post:
 *     tags: [Master Data]
 *     summary: Create a new mega menu category
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/MegaMenuCategory'
 *     responses:
 *       201:
 *         description: Category created successfully
 *
 * /api/masterdata/v1/mega_menu_categories_frontSide:
 *   get:
 *     tags: [Master Data]
 *     summary: Get frontend mega menu categories
 *     responses:
 *       200:
 *         description: Frontend categories retrieved successfully
 *
 * /api/masterdata/v1/translations:
 *   get:
 *     tags: [Master Data]
 *     summary: Get all translations
 *     responses:
 *       200:
 *         description: Translations retrieved successfully
 *
 *   post:
 *     tags: [Master Data]
 *     summary: Create new translation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               type:
 *                 type: string
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       201:
 *         description: Translation created successfully
 *
 * /api/masterdata/v1/translations/table:
 *   get:
 *     tags: [Master Data]
 *     summary: Get translations table
 *     responses:
 *       200:
 *         description: Translations table retrieved successfully
 *
 * /api/masterdata/v1/translations/{id}:
 *   put:
 *     tags: [Master Data]
 *     summary: Update translation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Translation updated successfully
 *       404:
 *         description: Translation not found
 */
