## Fill-Out-Filter

#### Specifications
Node server contains only one endpoint, for fetching responses from a form, along with few query parameters includes filters. 

> Endpoint will mirror the [existing responses endpoint of fillout API](https://www.fillout.com/help/fillout-rest-api#d8b24260dddd4aaa955f85e54f4ddb4d), except it will have a new parameter for filtering. 

#### Sample Request

- Path: `/{formId}/filteredResponses`
- Method: `GET`
- Query parameters: same as our [responses endpoint](https://www.fillout.com/help/fillout-rest-api#d8b24260dddd4aaa955f85e54f4ddb4d), except for a new `filters` parameter (JSON stringified):

```tsx
type FilterClauseType = {
	id: string;
	condition: 'equals' | 'does_not_equal' | 'greater_than' | 'less_than';
	value: number | string;
}

// each of these filters should be applied like an AND in a "where" clause
// in SQL
type ResponseFiltersType = ResponseFilter[];
```

#### Example Input:
```
[
	{
		id: "nameId",
		condition: "equals",
		value: "Timmy",
	},
	{
		id: "birthdayId",
		condition: "greater_than",
		value: "2024-02-23T05:01:47.691Z"
	}
]
```

#### Sample Response:
``` 
{
	"responses": [
		{
			"questions": [
				{
					"id": "nameId",
					"name": "What's your name?",
					"type": "ShortAnswer",
					"value": "Timmy"
				},
				{
					"id": "birthdayId",
					"name": "What is your birthday?",
					"type": "DatePicker",
					"value": "2024-02-22T05:01:47.691Z"
				},
			],
			"submissionId": "abc",
			"submissionTime": "2024-05-16T23:20:05.324Z"
			// please include any additional keys
		},
	],
	"totalResponses": 1,
	"pageCount": 1
}
```

#### Tech Stacks
* NodeJS. 
* Express.js




--

Thanks 🙏,

~ 👩🏻‍💻 Baby Manisha Sunkara

~ 🌐 https://babymanisha.com

~ 📧 babymaneesha@gmail.com 
