/**
 * @swagger
 * components:
 *   schemas:
 *     Template4:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         nameEn:
 *           type: string
 *         nameAr:
 *           type: string
 *         seoDescriptionEn:
 *           type: string
 *         seoDescriptionAr:
 *           type: string
 *         isActive:
 *           type: boolean
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
 *         description4En:
 *           type: string
 *         description4Ar:
 *           type: string
 *         image1:
 *           type: string
 *         image2:
 *           type: string
 *         image3:
 *           type: string
 *         buttonText1En:
 *           type: string
 *         buttonText1Ar:
 *           type: string
 *         buttonText2En:
 *           type: string
 *         buttonText2Ar:
 *           type: string
 *         buttonNavigation1En:
 *           type: string
 *         buttonNavigation1Ar:
 *           type: string
 *         buttonNavigation2En:
 *           type: string
 *         buttonNavigation2Ar:
 *           type: string
 *         pageId:
 *           type: string
 *
 * /api/v1/template/template4:
 *   post:
 *     tags: [Templates]
 *     summary: Create a new template4
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nameEn
 *               - nameAr
 *               - pageId
 *             properties:
 *               nameEn:
 *                 type: string
 *               nameAr:
 *                 type: string
 *               pageId:
 *                 type: string
 *               image1:
 *                 type: string
 *                 format: binary
 *               image2:
 *                 type: string
 *                 format: binary
 *               image3:
 *                 type: string
 *                 format: binary
 *               description4En:
 *                 type: string
 *               description4Ar:
 *                 type: string
 *               buttonText1En:
 *                 type: string
 *               buttonText1Ar:
 *                 type: string
 *               buttonText2En:
 *                 type: string
 *               buttonText2Ar:
 *                 type: string
 *               buttonNavigation1En:
 *                 type: string
 *               buttonNavigation1Ar:
 *                 type: string
 *               buttonNavigation2En:
 *                 type: string
 *               buttonNavigation2Ar:
 *                 type: string
 *     responses:
 *       201:
 *         description: Template created successfully
 *
 *   get:
 *     tags: [Templates]
 *     summary: Get template4 by page ID
 *     parameters:
 *       - in: query
 *         name: pageId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *
 * /api/v1/template/template4/list:
 *   get:
 *     tags: [Templates]
 *     summary: Get all template4s with pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *
 * /api/v1/template/template4/{id}:
 *   put:
 *     tags: [Templates]
 *     summary: Update template4
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Template4'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *
 *   delete:
 *     tags: [Templates]
 *     summary: Delete template4
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *
 * /api/v1/template/template4/slug:
 *   get:
 *     tags: [Templates]
 *     summary: Get template4 by slug
 *     parameters:
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 */
