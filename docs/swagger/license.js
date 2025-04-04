/**
 * @swagger
 * components:
 *   schemas:
 *     License:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         license:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *         document:
 *           type: string
 *           format: uri
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * tags:
 *   name: License
 *   description: License management endpoints
 *
 * paths:
 *   /api/license/v1/verify:
 *     post:
 *       summary: Verify a license key
 *       tags: [License]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - licenseKey
 *               properties:
 *                 licenseKey:
 *                   type: string
 *                   description: The license key to verify
 *       responses:
 *         200:
 *           description: License verified successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiResponse'
 *         400:
 *           description: Bad request
 *         404:
 *           description: License not found
 *
 *   /api/license/v1:
 *     post:
 *       summary: Add a new license
 *       tags: [License]
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               required:
 *                 - license
 *                 - document
 *               properties:
 *                 license:
 *                   type: string
 *                   minLength: 3
 *                   maxLength: 100
 *                 document:
 *                   type: string
 *                   format: binary
 *                   description: PDF file only
 *       responses:
 *         201:
 *           description: License added successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiResponse'
 *         400:
 *           description: Bad request - Invalid input or license already exists
 *         415:
 *           description: Unsupported Media Type - Document must be PDF
 *
 *     get:
 *       tags: [License]
 *       summary: Get all licenses with pagination and search
 *       parameters:
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             minimum: 1
 *             default: 1
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 100
 *             default: 10
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Licenses retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiResponse'
 *
 *   /api/license/v1/{id}:
 *     delete:
 *       tags: [License]
 *       summary: Delete a license
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *       responses:
 *         200:
 *           description: License deleted successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiResponse'
 *         404:
 *           description: License not found
 */
