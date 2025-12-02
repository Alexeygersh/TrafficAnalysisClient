import { Component, EventEmitter, Output } from '@angular/core';

export interface PacketFilterCriteria {
  searchTerm: string;
  protocol: string;
  threatLevel: string;
  dateFrom: string;
  dateTo: string;
  sourceIp: string;
  destIp: string;
}


@Component({
  selector: 'app-packet-filter',
  imports: [],
  templateUrl: './packet-filter.html',
  styleUrl: './packet-filter.css',
})
export class PacketFilter {
  @Output() filterChange = new EventEmitter<PacketFilterCriteria>();
  @Output() resetFilters = new EventEmitter<void>();

  filterCriteria: PacketFilterCriteria = {
    searchTerm: '',
    protocol: 'all',
    threatLevel: 'all',
    dateFrom: '',
    dateTo: '',
    sourceIp: '',
    destIp: ''
  };

  protocols = [
    { value: 'all', label: 'Все протоколы' },
    { value: 'TCP', label: 'TCP' },
    { value: 'UDP', label: 'UDP' },
    { value: 'HTTP', label: 'HTTP' },
    { value: 'HTTPS', label: 'HTTPS' },
    { value: 'DNS', label: 'DNS' },
    { value: 'ICMP', label: 'ICMP' }
  ];

  threatLevels = [
    { value: 'all', label: 'Все уровни' },
    { value: 'low', label: 'Низкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'high', label: 'Высокий' },
    { value: 'critical', label: 'Критический' }
  ];

  isExpanded = true;

  onFilterChange(): void {
    this.filterChange.emit(this.filterCriteria);
  }

  onReset(): void {
    this.filterCriteria = {
      searchTerm: '',
      protocol: 'all',
      threatLevel: 'all',
      dateFrom: '',
      dateTo: '',
      sourceIp: '',
      destIp: ''
    };
    this.resetFilters.emit();
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

}
