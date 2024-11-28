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
 *           example: "Home Page"
 *         nameAr:
 *           type: string
 *           example: "الصفحة الرئيسية"
 *         slug:
 *           type: string
 *           example: "home"
 *         template:
 *           type: array
 *           items:
 *             type: string
 *           example: ["template1", "template2"]
 *     PageUpdate:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         nameEn:
 *           type: string
 *           example: "Updated Page"
 *         nameAr:
 *           type: string
 *           example: "صفحة محدثة"
 *         slug:
 *           type: string
 *           example: "updated-page"
 *         template:
 *           type: array
 *           items:
 *             type: string
 *           example: ["template1", "template3"]
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
 *           type: array
 *           items:
 *             type: string
 *           example: ["template1", "template2"]
 *         subMenus:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubMenu'
 *         template1:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Template1'
 *         template2:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Template2'
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
 *     responses:
 *       201:
 *         description: Page created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Page created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       $ref: '#/components/schemas/Page'
 *       400:
 *         description: Validation error
 *   get:
 *     summary: Get all pages
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: List of pages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Pages retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Page'
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
 *         description: Template type (e.g., template1, template2)
 *     responses:
 *       200:
 *         description: List of pages with specified template
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Pages retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Page'
 *       404:
 *         description: No pages found with specified template
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
 *     responses:
 *       200:
 *         description: Page retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Page retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       $ref: '#/components/schemas/Page'
 *       404:
 *         description: Page not found
 *   put:
 *     summary: Update a page
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Page updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       $ref: '#/components/schemas/Page'
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
 *     responses:
 *       200:
 *         description: Page deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Page deleted successfully"
 *       404:
 *         description: Page not found
 */
