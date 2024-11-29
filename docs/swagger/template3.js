/**
 * @swagger
 * components:
 *   schemas:
 *     Template3:
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
 * /api/v1/template/template3:
 *   post:
 *     tags: [Templates3]
 *     summary: Create a new template3
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
 *               headingEn:
 *                 type: string
 *               headingAr:
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
 *     tags: [Templates3]
 *     summary: Get template3 by page ID
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
 * /api/v1/template/template3/list:
 *   get:
 *     tags: [Templates3]
 *     summary: Get all template3s with pagination
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
 * /api/v1/template/template3/{id}:
 *   put:
 *     summary: Update specific fields of template3
 *     tags: [Templates3]
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
 *             type: object
 *             minProperties: 1
 *             properties:
 *               nameEn:
 *                 type: string
 *               nameAr:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               pageId:
 *                 type: string
 *               seoDescriptionEn:
 *                 type: string
 *               seoDescriptionAr:
 *                 type: string
 *               headingEn:
 *                 type: string
 *               headingAr:
 *                 type: string
 *               description1En:
 *                 type: string
 *               description1Ar:
 *                 type: string
 *               description2En:
 *                 type: string
 *               description2Ar:
 *                 type: string
 *               description3En:
 *                 type: string
 *               description3Ar:
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
 *       200:
 *         description: Template updated successfully
 *       400:
 *         description: Invalid input or no fields to update
 *       404:
 *         description: Template not found
 *
 *   delete:
 *     tags: [Templates3]
 *     summary: Delete template3
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
 * /api/v1/template/template3/slug:
 *   get:
 *     tags: [Templates3]
 *     summary: Get template3 by slug
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
