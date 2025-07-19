/**
 * @swagger
 * /api/v1/template/halalTemplate:
 *   post:
 *     summary: Create a new halalTemplate
 *     tags: [HalalTemplate]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/HalalTemplate'
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Page not found
 *
 *   get:
 *     summary: Get halalTemplate by page ID
 *     tags: [HalalTemplate]
 *     parameters:
 *       - in: query
 *         name: pageId
 *         schema:
 *           type: string
 *         required: true
 *         description: Page ID
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 *
 * /api/v1/template/halalTemplate/list:
 *   get:
 *     summary: Get all halalTemplate entries
 *     tags: [HalalTemplate]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *
 * /api/v1/template/halalTemplate/{id}:
 *   put:
 *     summary: Update specific fields of halalTemplate
 *     tags: [HalalTemplate]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/HalalTemplate'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       400:
 *         description: Invalid input or no fields to update
 *       404:
 *         description: Template not found
 *
 *   delete:
 *     summary: Delete a halalTemplate
 *     tags: [HalalTemplate]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       404:
 *         description: Template not found
 *
 * /api/v1/template/halalTemplate/slug:
 *   get:
 *     summary: Get halalTemplate by slug
 *     tags: [HalalTemplate]
 *     parameters:
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Page slug
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 *
 * components:
 *   schemas:
 *     HalalTemplate:
 *       type: object
 *       properties:
 *         headerEn:
 *           type: string
 *         headerAr:
 *           type: string
 *         descriptionEn:
 *           type: string
 *         descriptionAr:
 *           type: string
 *         image1:
 *           type: string
 *           format: binary
 *         pageId:
 *           type: string
 */
