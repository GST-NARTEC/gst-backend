/**
 * @swagger
 * /api/v1/template/sunrize2027Template:
 *   post:
 *     summary: Create a new sunrize2027Template
 *     tags: [Sunrize2027Template]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Sunrize2027Template'
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Page not found
 *
 *   get:
 *     summary: Get sunrize2027Template by page ID
 *     tags: [Sunrize2027Template]
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
 * /api/v1/template/sunrize2027Template/list:
 *   get:
 *     summary: Get all sunrize2027Template entries
 *     tags: [Sunrize2027Template]
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
 * /api/v1/template/sunrize2027Template/{id}:
 *   put:
 *     summary: Update specific fields of sunrize2027Template
 *     tags: [Sunrize2027Template]
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
 *               description4En:
 *                 type: string
 *               description4Ar:
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
 *     summary: Delete a sunrize2027Template
 *     tags: [Sunrize2027Template]
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
 * /api/v1/template/sunrize2027Template/slug:
 *   get:
 *     summary: Get sunrize2027Template by slug
 *     tags: [Sunrize2027Template]
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
 *     Sunrize2027Template:
 *       type: object
 *       properties:
 *         nameEn:
 *           type: string
 *           description: Name in English
 *         nameAr:
 *           type: string
 *           description: Name in Arabic
 *         seoDescriptionEn:
 *           type: string
 *           description: SEO description in English
 *         seoDescriptionAr:
 *           type: string
 *           description: SEO description in Arabic
 *         isActive:
 *           type: boolean
 *           description: Whether the template is active
 *         headingEn:
 *           type: string
 *           description: Heading in English
 *         headingAr:
 *           type: string
 *           description: Heading in Arabic
 *         description1En:
 *           type: string
 *           description: First description in English
 *         description1Ar:
 *           type: string
 *           description: First description in Arabic
 *         description2En:
 *           type: string
 *           description: Second description in English
 *         description2Ar:
 *           type: string
 *           description: Second description in Arabic
 *         description3En:
 *           type: string
 *           description: Third description in English
 *         description3Ar:
 *           type: string
 *           description: Third description in Arabic
 *         description4En:
 *           type: string
 *           description: Fourth description in English
 *         description4Ar:
 *           type: string
 *           description: Fourth description in Arabic
 *         image1:
 *           type: string
 *           format: binary
 *         image2:
 *           type: string
 *           format: binary
 *         image3:
 *           type: string
 *           format: binary
 *         buttonText1En:
 *           type: string
 *           description: First button text in English
 *         buttonText1Ar:
 *           type: string
 *           description: First button text in Arabic
 *         buttonText2En:
 *           type: string
 *           description: Second button text in English
 *         buttonText2Ar:
 *           type: string
 *           description: Second button text in Arabic
 *         buttonNavigation1En:
 *           type: string
 *           description: First button navigation in English
 *         buttonNavigation1Ar:
 *           type: string
 *           description: First button navigation in Arabic
 *         buttonNavigation2En:
 *           type: string
 *           description: Second button navigation in English
 *         buttonNavigation2Ar:
 *           type: string
 *           description: Second button navigation in Arabic
 *         pageId:
 *           type: string
 *           description: ID of the associated page
 */
