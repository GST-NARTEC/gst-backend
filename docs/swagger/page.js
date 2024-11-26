/**
 * @swagger
 * components:
 *   schemas:
 *     PageCreate:
 *       type: object
 *       required:
 *         - nameEn
 *         - nameAr
 *         - slug
 *         - template
 *       properties:
 *         nameEn:
 *           type: string
 *         nameAr:
 *           type: string
 *         slug:
 *           type: string
 *         template:
 *           type: string
 *     PageUpdate:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         nameEn:
 *           type: string
 *         nameAr:
 *           type: string
 *         slug:
 *           type: string
 *         template:
 *           type: string
 *     Page:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         nameEn:
 *           type: string
 *         nameAr:
 *           type: string
 *         slug:
 *           type: string
 *         template:
 *           type: string
 *         subMenus:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubMenu'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/page/v1:
 *   post:
 *     summary: Create a new page
 *     tags: [Pages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PageCreate'
 *   get:
 *     summary: Get all pages
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: List of pages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Page'
 *
 * /api/page/v1/template/{template}:
 *   get:
 *     summary: Get pages by template
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: template
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of pages with specified template
 *
 * /api/page/v1/{id}:
 *   get:
 *     summary: Get a page by ID
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *   put:
 *     summary: Update a page
 *     description: Update one or more fields of a page. At least one field must be provided.
 *     tags: [Pages]
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
 *             $ref: '#/components/schemas/PageUpdate'
 *     responses:
 *       200:
 *         description: Page updated successfully
 *       400:
 *         description: Validation error or no fields provided
 *       404:
 *         description: Page not found
 *   delete:
 *     summary: Delete a page
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
