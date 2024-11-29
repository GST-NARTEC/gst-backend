/**
 * @swagger
 * components:
 *   schemas:
 *     Template2Create:
 *       type: object
 *       required:
 *         - nameEn
 *         - nameAr
 *         - pageId
 *       properties:
 *         nameEn:
 *           type: string
 *         nameAr:
 *           type: string
 *         isActive:
 *           type: boolean
 *           default: true
 *         pageId:
 *           type: string
 *         seoDescriptionEn:
 *           type: string
 *         seoDescriptionAr:
 *           type: string
 *         headingEn:
 *           type: string
 *         headingAr:
 *           type: string
 *         description1En:
 *           type: string
 *         description1Ar:
 *           type: string
 *         description2En:
 *           type: string
 *         description2Ar:
 *           type: string
 *         description3En:
 *           type: string
 *         description3Ar:
 *           type: string
 *         image1:
 *           type: string
 *           format: binary
 *         image2:
 *           type: string
 *           format: binary
 *         image3:
 *           type: string
 *           format: binary
 *
 * /api/template/v1/template2:
 *   post:
 *     summary: Create a new template2
 *     tags: [Template2]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Template2Create'
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Template created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     template:
 *                       $ref: '#/components/schemas/Template2Create'
 *       400:
 *         description: Invalid input or template already exists for page
 *       404:
 *         description: Page not found
 *
 *   get:
 *     summary: Get template2 by page ID
 *     tags: [Template2]
 *     parameters:
 *       - in: query
 *         name: pageId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 *
 * /api/template/v1/template2/list:
 *   get:
 *     summary: Get all template2 entries
 *     tags: [Template2]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Templates retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     templates:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Template2Create'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *
 * /api/template/v1/template2/{id}:
 *   put:
 *     summary: Update a template2
 *     tags: [Template2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Template2Create'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       404:
 *         description: Template not found
 *
 *   delete:
 *     summary: Delete a template2
 *     tags: [Template2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       404:
 *         description: Template not found
 */
