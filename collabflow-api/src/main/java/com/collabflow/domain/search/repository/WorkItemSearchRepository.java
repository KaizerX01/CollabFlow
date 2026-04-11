package com.collabflow.domain.search.repository;

import com.collabflow.domain.search.model.WorkItemDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface WorkItemSearchRepository extends ElasticsearchRepository<WorkItemDocument, String> {
}
