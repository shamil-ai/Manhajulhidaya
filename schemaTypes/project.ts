export const projectType = {
  name: 'project',
    title: 'Project',
      type: 'document',
        fields: [
            {
                  name: 'title',
                        title: 'Title',
                              type: 'string',
                                  },
                                      {
                                            name: 'description',
                                                  title: 'Description',
                                                        type: 'text',
                                                            },
                                                                {
                                                                      name: 'image',
                                                                            title: 'Project Image',
                                                                                  type: 'image',
                                                                                        options: {
                                                                                                hotspot: true, // ഇമേജ് ക്രോപ്പ് ചെയ്യാൻ സഹായിക്കും
                                                                                                      },
                                                                                                          },
                                                                                                            ],
                                                                                                            }
                                                                                                            
